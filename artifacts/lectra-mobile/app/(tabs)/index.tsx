import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
  ActivityIndicator, Platform, KeyboardAvoidingView,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { generateLocalLesson } from "@/lib/lesson-generator";
import { saveLesson, listLessons, type StoredLesson } from "@/lib/lesson-storage";
import ShapeIcon from "@/components/ShapeIcon";
import { useCallback } from "react";

const SUGGESTIONS = [
  "Tata Surya", "Sel Hewan", "Atom & Molekul",
  "Fotosintesis", "DNA & Genetika", "Hukum Newton",
  "Ekosistem", "Siklus Air", "Vulkanik",
];

const LEVELS = ["SD", "SMP", "SMA", "Kuliah"];

export default function CreateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("SMP");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<StoredLesson[]>([]);
  const inputRef = useRef<TextInput>(null);

  const loadRecent = useCallback(async () => {
    const data = await listLessons();
    setRecent(data.slice(0, 3));
  }, []);

  useFocusEffect(useCallback(() => { loadRecent(); }, [loadRecent]));

  const steps = ["Menganalisis topik…", "Menyusun konten…", "Membuat model 3D…", "Selesai!"];

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const id = setInterval(() => setLoadingStep((s) => (s + 1) % steps.length), 900);
    return () => clearInterval(id);
  }, [loading]);

  async function onGenerate() {
    if (!topic.trim() || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    try {
      const lesson = await generateLocalLesson(topic.trim(), "id", level);
      const saved = await saveLesson(topic.trim(), lesson);
      setTopic("");
      router.push(`/lesson/${saved.id}` as any);
    } catch (e) {
      setError("Gagal membuat materi. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 8,
    },
    wordmark: {
      fontSize: 28, fontWeight: "700",
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    wordmarkAccent: { color: colors.accent },
    tagline: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    inputCard: {
      marginHorizontal: 16, marginTop: 16,
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
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 14, paddingVertical: 10,
    },
    charCount: { fontSize: 12, color: colors.mutedForeground },
    sectionLabel: {
      paddingHorizontal: 20, marginTop: 20, marginBottom: 8,
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
      marginHorizontal: 16, marginTop: 20,
      paddingVertical: 16, borderRadius: 100,
      alignItems: "center",
      backgroundColor: colors.accent,
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

  const [inputFocused, setInputFocused] = useState(false);

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
        <View style={s.header}>
          <Text style={s.wordmark}>
            <Text style={s.wordmarkAccent}>Lectra</Text>
          </Text>
          <Text style={s.tagline}>Buat materi 3D dalam hitungan detik ✨</Text>
        </View>

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
            maxLength={300}
            returnKeyType="done"
          />
          <View style={s.inputDivider} />
          <View style={s.inputFooter}>
            <Text style={s.charCount}>{topic.length}/300</Text>
            {topic.length > 0 && (
              <Pressable onPress={() => setTopic("")}>
                <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>

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

        {/* Suggestions */}
        <Text style={s.sectionLabel}>Topik Populer</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.suggestionsRow}>
          {SUGGESTIONS.map((s_) => (
            <Pressable
              key={s_}
              style={s.chip}
              onPress={() => { setTopic(s_); Haptics.selectionAsync(); inputRef.current?.focus(); }}
            >
              <Text style={s.chipText}>{s_}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Generate button */}
        <Pressable
          style={[s.generateBtn, (!topic.trim() || loading) && s.generateBtnDisabled]}
          onPress={onGenerate}
          disabled={!topic.trim() || loading}
        >
          <Ionicons name="cube-outline" size={20} color="#fff" />
          <Text style={s.generateText}>Buat Materi 3D</Text>
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
