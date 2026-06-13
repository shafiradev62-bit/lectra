import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
  ActivityIndicator, Platform, KeyboardAvoidingView, Image,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useColors } from "@/hooks/useColors";
import { generateLocalLesson } from "@/lib/lesson-generator";
import { generateFromPhotos } from "@/lib/ar3d-client";
import { saveLesson, listLessons, type StoredLesson } from "@/lib/lesson-storage";
import ShapeIcon from "@/components/ShapeIcon";

const SUGGESTIONS = [
  "Tata Surya", "Sel Hewan", "Atom & Molekul",
  "Fotosintesis", "DNA & Genetika", "Hukum Newton",
  "Ekosistem", "Siklus Air", "Vulkanik",
];

const LEVELS = ["SD", "SMP", "SMA", "Kuliah"];
type CreateMode = "topic" | "photo";

export default function CreateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<CreateMode>("topic");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("SMP");
  const [photos, setPhotos] = useState<{ uri: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<StoredLesson[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const loadRecent = useCallback(async () => {
    const data = await listLessons();
    setRecent(data.slice(0, 3));
  }, []);

  useFocusEffect(useCallback(() => { loadRecent(); }, [loadRecent]));

  const topicSteps = [
    "Menganalisis topik…", "Menyusun konten…",
    "Membangun model 3D…", "Selesai!",
  ];
  const photoSteps = [
    "Mengunggah foto…", "Memproses gambar…",
    "Membangun model 3D…", "Menyusun materi…", "Selesai!",
  ];
  const steps = mode === "photo" ? photoSteps : topicSteps;

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const id = setInterval(() => setLoadingStep((s) => (s + 1) % steps.length), 900);
    return () => clearInterval(id);
  }, [loading]);

  // ── Photo picker ─────────────────────────────────────────────────────────────

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Izin galeri diperlukan untuk memilih foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 8 - photos.length,
    });
    if (!result.canceled) {
      const newPhotos = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName ?? `photo_${Date.now()}.jpg`,
      }));
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 8));
      Haptics.selectionAsync();
    }
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError("Izin kamera diperlukan untuk mengambil foto.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) {
      setPhotos((prev) =>
        [...prev, { uri: result.assets[0].uri, name: `photo_${Date.now()}.jpg` }].slice(0, 8)
      );
      Haptics.selectionAsync();
    }
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Generate ─────────────────────────────────────────────────────────────────

  async function onGenerateTopic() {
    if (!topic.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    try {
      const lesson = await generateLocalLesson(topic.trim(), "id", level);
      const saved = await saveLesson(topic.trim(), lesson);
      setTopic("");
      router.push(`/lesson/${saved.id}` as any);
    } catch {
      setError("Gagal membuat materi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function onGeneratePhoto() {
    if (photos.length === 0 || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    try {
      const label = topic.trim() || "Objek 3D Scan";
      // Attempt photogrammetry via the AR3D backend; fall back gracefully if offline
      const mode3d = photos.length >= 4 ? "photogrammetry" : "single_image";
      const model = await generateFromPhotos(photos.map((p) => p.uri), mode3d);
      const lesson = await generateLocalLesson(label, "id", level, model ?? undefined);
      const saved = await saveLesson(label, lesson);
      setPhotos([]);
      setTopic("");
      router.push(`/lesson/${saved.id}` as any);
    } catch {
      setError("Gagal membuat materi dari foto. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  // ── Styles ───────────────────────────────────────────────────────────────────

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    wordmark: {
      fontSize: 28, fontWeight: "700",
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    wordmarkAccent: { color: colors.accent },
    tagline: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    modeSwitcher: {
      flexDirection: "row", gap: 0,
      marginHorizontal: 16, marginTop: 16,
      backgroundColor: colors.muted,
      borderRadius: 100, padding: 3,
    },
    modeBtn: {
      flex: 1, paddingVertical: 9, borderRadius: 100,
      alignItems: "center", flexDirection: "row",
      justifyContent: "center", gap: 6,
    },
    modeBtnActive: { backgroundColor: colors.card },
    modeBtnText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
    modeBtnTextActive: { color: colors.foreground },
    inputCard: {
      marginHorizontal: 16, marginTop: 14,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      borderColor: colors.border,
      overflow: "hidden",
    },
    inputCardFocused: { borderColor: colors.accent },
    input: {
      padding: 16, fontSize: 15,
      color: colors.foreground,
      minHeight: 56,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    inputDivider: { height: 1, backgroundColor: colors.border },
    inputFooter: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14, paddingVertical: 10,
    },
    charCount: { fontSize: 12, color: colors.mutedForeground },
    photoGrid: {
      flexDirection: "row", flexWrap: "wrap", gap: 8,
      marginHorizontal: 16, marginTop: 14,
    },
    photoThumb: {
      width: 80, height: 80, borderRadius: 12,
      overflow: "hidden", position: "relative",
    },
    photoImg: { width: 80, height: 80 },
    photoRemove: {
      position: "absolute", top: 4, right: 4,
      width: 20, height: 20, borderRadius: 10,
      backgroundColor: "rgba(0,0,0,0.55)",
      alignItems: "center", justifyContent: "center",
    },
    photoAdd: {
      width: 80, height: 80, borderRadius: 12,
      backgroundColor: colors.muted,
      borderWidth: 1.5, borderColor: colors.border,
      borderStyle: "dashed",
      alignItems: "center", justifyContent: "center", gap: 4,
    },
    photoAddText: { fontSize: 10, color: colors.mutedForeground },
    photoBtns: {
      flexDirection: "row", gap: 8,
      marginHorizontal: 16, marginTop: 10,
    },
    photoBtn: {
      flex: 1, flexDirection: "row", alignItems: "center",
      justifyContent: "center", gap: 6,
      paddingVertical: 11, borderRadius: 100,
      borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.card,
    },
    photoBtnText: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    photoHint: {
      marginHorizontal: 16, marginTop: 8,
      fontSize: 12, color: colors.mutedForeground,
      textAlign: "center",
    },
    sectionLabel: {
      paddingHorizontal: 20, marginTop: 18, marginBottom: 8,
      fontSize: 12, fontWeight: "700",
      color: colors.mutedForeground,
      letterSpacing: 0.8, textTransform: "uppercase",
    },
    levelRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
    levelBtn: {
      flex: 1, paddingVertical: 10, borderRadius: 100,
      alignItems: "center",
      borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.card,
    },
    levelBtnActive: { borderColor: colors.accent, backgroundColor: colors.accent + "18" },
    levelText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground },
    levelTextActive: { color: colors.accent },
    suggestionsRow: { paddingLeft: 16, paddingBottom: 4 },
    chip: {
      paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 100, marginRight: 8,
      borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.card,
    },
    chipText: { fontSize: 13, color: colors.foreground },
    generateBtn: {
      marginHorizontal: 16, marginTop: 18,
      paddingVertical: 16, borderRadius: 100,
      alignItems: "center", backgroundColor: colors.accent,
      flexDirection: "row", justifyContent: "center", gap: 8,
    },
    generateBtnDisabled: { backgroundColor: colors.muted },
    generateText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    errorBox: {
      marginHorizontal: 16, marginTop: 10,
      padding: 12, borderRadius: 12,
      backgroundColor: "#C94A2F22",
      flexDirection: "row", alignItems: "center", gap: 8,
    },
    errorText: { flex: 1, fontSize: 13, color: "#C94A2F" },
    recentLabel: {
      paddingHorizontal: 20, marginTop: 24, marginBottom: 10,
      fontSize: 12, fontWeight: "700",
      color: colors.mutedForeground,
      letterSpacing: 0.8, textTransform: "uppercase",
    },
    recentCard: {
      marginHorizontal: 16, marginBottom: 8,
      flexDirection: "row", alignItems: "center", gap: 12,
      backgroundColor: colors.card,
      borderRadius: 14, padding: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    recentTopic: { fontSize: 13, fontWeight: "700", color: colors.foreground },
    recentTitle: { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background + "EE",
      alignItems: "center", justifyContent: "center", gap: 16,
    },
    loadingText: { fontSize: 16, color: colors.foreground },
  });

  const canGenerate = mode === "topic" ? topic.trim().length > 0 : photos.length > 0;

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.wordmark}>
            <Text style={s.wordmarkAccent}>Lectra</Text>
          </Text>
          <Text style={s.tagline}>Buat materi 3D dalam hitungan detik</Text>
        </View>

        {/* Mode switcher */}
        <View style={s.modeSwitcher}>
          {(["topic", "photo"] as CreateMode[]).map((m) => (
            <Pressable
              key={m}
              style={[s.modeBtn, mode === m && s.modeBtnActive]}
              onPress={() => { setMode(m); setError(null); Haptics.selectionAsync(); }}
            >
              <Ionicons
                name={m === "topic" ? "text-outline" : "camera-outline"}
                size={15}
                color={mode === m ? colors.foreground : colors.mutedForeground}
              />
              <Text style={[s.modeBtnText, mode === m && s.modeBtnTextActive]}>
                {m === "topic" ? "Topik" : "Foto"}
              </Text>
            </Pressable>
          ))}
        </View>

        {mode === "topic" ? (
          <>
            {/* Topic input */}
            <View style={[s.inputCard, inputFocused && s.inputCardFocused]}>
              <TextInput
                ref={inputRef}
                style={s.input}
                placeholder="Topik pelajaran… cth: Sel Hewan, Tata Surya"
                placeholderTextColor={colors.mutedForeground}
                value={topic}
                onChangeText={setTopic}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                multiline
                maxLength={500}
                returnKeyType="done"
              />
              <View style={s.inputDivider} />
              <View style={s.inputFooter}>
                <Text style={s.charCount}>{topic.length}/500</Text>
                {topic.length > 0 && (
                  <Pressable onPress={() => setTopic("")}>
                    <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
                  </Pressable>
                )}
              </View>
            </View>

            {/* Suggestions */}
            <Text style={s.sectionLabel}>Topik Populer</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestionsRow}>
              {SUGGESTIONS.map((sg) => (
                <Pressable
                  key={sg}
                  style={s.chip}
                  onPress={() => { setTopic(sg); Haptics.selectionAsync(); inputRef.current?.focus(); }}
                >
                  <Text style={s.chipText}>{sg}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : (
          <>
            {/* Photo mode */}
            {photos.length > 0 && (
              <View style={s.photoGrid}>
                {photos.map((p, i) => (
                  <View key={i} style={s.photoThumb}>
                    <Image source={{ uri: p.uri }} style={s.photoImg} resizeMode="cover" />
                    <Pressable style={s.photoRemove} onPress={() => removePhoto(i)}>
                      <Ionicons name="close" size={12} color="#fff" />
                    </Pressable>
                  </View>
                ))}
                {photos.length < 8 && (
                  <Pressable style={s.photoAdd} onPress={pickFromGallery}>
                    <Ionicons name="add" size={22} color={colors.mutedForeground} />
                    <Text style={s.photoAddText}>Tambah</Text>
                  </Pressable>
                )}
              </View>
            )}

            <View style={s.photoBtns}>
              <Pressable style={s.photoBtn} onPress={pickFromCamera}>
                <Ionicons name="camera-outline" size={18} color={colors.foreground} />
                <Text style={s.photoBtnText}>Kamera</Text>
              </Pressable>
              <Pressable style={s.photoBtn} onPress={pickFromGallery}>
                <Ionicons name="images-outline" size={18} color={colors.foreground} />
                <Text style={s.photoBtnText}>Galeri</Text>
              </Pressable>
            </View>

            <Text style={s.photoHint}>
              {photos.length === 0
                ? "Ambil foto benda nyata atau pilih dari galeri (maks. 8 foto)"
                : `${photos.length} foto dipilih — tambahkan label opsional di bawah`}
            </Text>

            {/* Optional label */}
            <View style={[s.inputCard, inputFocused && s.inputCardFocused, { marginTop: 12 }]}>
              <TextInput
                ref={inputRef}
                style={[s.input, { minHeight: 46 }]}
                placeholder="Label opsional… cth: Kupu-kupu, Sel Darah"
                placeholderTextColor={colors.mutedForeground}
                value={topic}
                onChangeText={setTopic}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                maxLength={200}
              />
            </View>
          </>
        )}

        {/* Level */}
        <Text style={s.sectionLabel}>Tingkat</Text>
        <View style={s.levelRow}>
          {LEVELS.map((l) => (
            <Pressable
              key={l}
              style={[s.levelBtn, level === l && s.levelBtnActive]}
              onPress={() => { setLevel(l); Haptics.selectionAsync(); }}
            >
              <Text style={[s.levelText, level === l && s.levelTextActive]}>{l}</Text>
            </Pressable>
          ))}
        </View>

        {/* Generate button */}
        <Pressable
          style={[s.generateBtn, (!canGenerate || loading) && s.generateBtnDisabled]}
          onPress={mode === "topic" ? onGenerateTopic : onGeneratePhoto}
          disabled={!canGenerate || loading}
        >
          <Ionicons name="cube-outline" size={20} color="#fff" />
          <Text style={s.generateText}>
            {mode === "topic" ? "Buat Materi 3D" : "Buat dari Foto"}
          </Text>
        </Pressable>

        {/* Error */}
        {error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color="#C94A2F" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* Recent lessons */}
        {recent.length > 0 && (
          <>
            <Text style={s.recentLabel}>Terakhir Dibuat</Text>
            {recent.map((item) => {
              const shape = item.lesson?.sections?.[0]?.shape;
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [s.recentCard, { opacity: pressed ? 0.7 : 1 }]}
                  onPress={() => router.push(`/lesson/${item.id}` as any)}
                >
                  <ShapeIcon
                    type={shape?.type ?? "sphere"}
                    color={shape?.color ?? colors.accent}
                    size={38}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.recentTopic} numberOfLines={1}>{item.topic}</Text>
                    <Text style={s.recentTitle} numberOfLines={1}>{item.lesson?.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Loading overlay */}
      {loading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={s.loadingText}>{steps[loadingStep]}</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
