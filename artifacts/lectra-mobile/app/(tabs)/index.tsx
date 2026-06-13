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
import { scanImageForTopic } from "@/lib/vision-client";
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

  // Photo mode state
  const [scannedPhoto, setScannedPhoto] = useState<{ uri: string; base64?: string } | null>(null);
  const [scanning, setScanning] = useState(false);
  const [detectedTopic, setDetectedTopic] = useState<string | null>(null);

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
    "Membaca gambar…", "Menganalisis konten…",
    "Menyusun materi…", "Membangun model 3D…", "Selesai!",
  ];
  const steps = mode === "photo" ? photoSteps : topicSteps;

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const id = setInterval(() => setLoadingStep((s) => (s + 1) % steps.length), 900);
    return () => clearInterval(id);
  }, [loading]);

  // ── Photo capture + vision scan ──────────────────────────────────────────────

  async function runVisionScan(uri: string, base64?: string) {
    if (!base64) {
      setScannedPhoto({ uri });
      return;
    }
    setScannedPhoto({ uri, base64 });
    setScanning(true);
    setDetectedTopic(null);
    setTopic("");
    try {
      const result = await scanImageForTopic(base64, "image/jpeg");
      if (result.confidence !== "none" && result.topic.trim()) {
        setDetectedTopic(result.topic.trim());
        setTopic(result.topic.trim());
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      // silently ignore — teacher types manually
    } finally {
      setScanning(false);
    }
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError("Izin kamera diperlukan untuk mengambil foto.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      Haptics.selectionAsync();
      await runVisionScan(asset.uri, asset.base64 ?? undefined);
    }
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError("Izin galeri diperlukan untuk memilih foto.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      Haptics.selectionAsync();
      await runVisionScan(asset.uri, asset.base64 ?? undefined);
    }
  }

  function clearPhoto() {
    setScannedPhoto(null);
    setDetectedTopic(null);
    setTopic("");
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

  async function onGenerateFromPhoto() {
    const effectiveTopic = topic.trim();
    if (!effectiveTopic || !scannedPhoto || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    try {
      const lesson = await generateLocalLesson(effectiveTopic, "id", level);
      const saved = await saveLesson(effectiveTopic, lesson);
      clearPhoto();
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

    // Photo scan UI
    photoScanArea: {
      marginHorizontal: 16, marginTop: 14,
    },
    photoPreviewCard: {
      borderRadius: 20, overflow: "hidden",
      borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.card,
      position: "relative",
    },
    photoPreviewImg: {
      width: "100%", height: 200,
    },
    photoOverlayBar: {
      position: "absolute", bottom: 0, left: 0, right: 0,
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: 14, paddingVertical: 10,
      flexDirection: "row", alignItems: "center", gap: 8,
    },
    photoOverlayText: { flex: 1, fontSize: 12, color: "#fff" },
    clearPhotoBtn: {
      position: "absolute", top: 10, right: 10,
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: "rgba(0,0,0,0.55)",
      alignItems: "center", justifyContent: "center",
    },
    scanningBadge: {
      marginHorizontal: 16, marginTop: 10,
      flexDirection: "row", alignItems: "center", gap: 8,
      paddingHorizontal: 14, paddingVertical: 9,
      borderRadius: 100,
      backgroundColor: colors.accent + "18",
      borderWidth: 1.5, borderColor: colors.accent + "40",
      alignSelf: "flex-start",
    },
    scanningText: { fontSize: 13, color: colors.accent, fontWeight: "600" },
    detectedBadge: {
      marginHorizontal: 16, marginTop: 10,
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: 100,
      backgroundColor: "#22c55e18",
      borderWidth: 1.5, borderColor: "#22c55e40",
      alignSelf: "flex-start",
    },
    detectedText: { fontSize: 12, color: "#22c55e", fontWeight: "600" },
    pickBtns: {
      flexDirection: "row", gap: 10,
    },
    pickBtn: {
      flex: 1, flexDirection: "row", alignItems: "center",
      justifyContent: "center", gap: 8,
      paddingVertical: 18, borderRadius: 20,
      borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.card,
    },
    pickBtnText: { fontSize: 14, fontWeight: "600", color: colors.foreground },
    pickBtnSub: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
    photoHint: {
      marginTop: 12, fontSize: 12, color: colors.mutedForeground,
      textAlign: "center",
    },
    confirmLabel: {
      marginHorizontal: 16, marginTop: 16,
      fontSize: 12, fontWeight: "700",
      color: colors.mutedForeground,
      letterSpacing: 0.8, textTransform: "uppercase",
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

  const canGenerate = mode === "topic"
    ? topic.trim().length > 0
    : Boolean(scannedPhoto && topic.trim().length > 0);

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
                name={m === "topic" ? "text-outline" : "scan-outline"}
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
            {/* Photo scan mode */}
            <View style={s.photoScanArea}>
              {scannedPhoto ? (
                /* ── Photo preview + extracted topic ── */
                <>
                  <View style={s.photoPreviewCard}>
                    <Image
                      source={{ uri: scannedPhoto.uri }}
                      style={s.photoPreviewImg}
                      resizeMode="cover"
                    />
                    {scanning && (
                      <View style={s.photoOverlayBar}>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={s.photoOverlayText}>Membaca gambar…</Text>
                      </View>
                    )}
                    <Pressable style={s.clearPhotoBtn} onPress={clearPhoto}>
                      <Ionicons name="close" size={16} color="#fff" />
                    </Pressable>
                  </View>

                  {scanning && (
                    <View style={s.scanningBadge}>
                      <ActivityIndicator size="small" color={colors.accent} />
                      <Text style={s.scanningText}>Menganalisis foto…</Text>
                    </View>
                  )}

                  {!scanning && detectedTopic && (
                    <View style={s.detectedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                      <Text style={s.detectedText}>Topik terdeteksi</Text>
                    </View>
                  )}

                  {!scanning && !detectedTopic && (
                    <Text style={s.photoHint}>
                      Ketik topik yang terlihat pada foto di bawah
                    </Text>
                  )}
                </>
              ) : (
                /* ── Pick photo buttons ── */
                <>
                  <View style={s.pickBtns}>
                    <Pressable style={s.pickBtn} onPress={pickFromCamera}>
                      <View style={{ alignItems: "center", gap: 4 }}>
                        <Ionicons name="camera-outline" size={28} color={colors.accent} />
                        <Text style={s.pickBtnText}>Kamera</Text>
                        <Text style={s.pickBtnSub}>Foto halaman buku</Text>
                      </View>
                    </Pressable>
                    <Pressable style={s.pickBtn} onPress={pickFromGallery}>
                      <View style={{ alignItems: "center", gap: 4 }}>
                        <Ionicons name="images-outline" size={28} color={colors.accent} />
                        <Text style={s.pickBtnText}>Galeri</Text>
                        <Text style={s.pickBtnSub}>Pilih dari foto</Text>
                      </View>
                    </Pressable>
                  </View>
                  <Text style={s.photoHint}>
                    Foto halaman buku, papan tulis, atau diagram — topik otomatis terdeteksi
                  </Text>
                </>
              )}
            </View>

            {/* Topic confirm / type input — shown once photo is picked */}
            {scannedPhoto && !scanning && (
              <>
                <Text style={s.confirmLabel}>
                  {detectedTopic ? "Konfirmasi Topik" : "Topik Pelajaran"}
                </Text>
                <View style={[s.inputCard, inputFocused && s.inputCardFocused]}>
                  <TextInput
                    ref={inputRef}
                    style={s.input}
                    placeholder="Ketik atau konfirmasi topik…"
                    placeholderTextColor={colors.mutedForeground}
                    value={topic}
                    onChangeText={(t) => {
                      setTopic(t);
                      if (detectedTopic && t !== detectedTopic) setDetectedTopic(null);
                    }}
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
                      <Pressable onPress={() => { setTopic(""); setDetectedTopic(null); }}>
                        <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
                      </Pressable>
                    )}
                  </View>
                </View>
              </>
            )}
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
          onPress={mode === "topic" ? onGenerateTopic : onGenerateFromPhoto}
          disabled={!canGenerate || loading || (mode === "photo" && scanning)}
        >
          <Ionicons
            name={mode === "photo" ? "sparkles-outline" : "cube-outline"}
            size={20}
            color="#fff"
          />
          <Text style={s.generateText}>
            {mode === "photo" ? "Buat Materi dari Foto" : "Buat Materi 3D"}
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
