import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  Platform, ActivityIndicator, Share,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { getLesson, type StoredLesson } from "@/lib/lesson-storage";
import ShapeIcon from "@/components/ShapeIcon";

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [stored, setStored] = useState<StoredLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const data = await getLesson(id);
      setStored(data);
      setLoading(false);
    })();
  }, [id]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    navBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 10,
      paddingHorizontal: 16,
      paddingBottom: 10,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { padding: 6, marginRight: 8 },
    navTitle: {
      flex: 1, fontSize: 16, fontWeight: "600",
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    scroll: { flex: 1 },
    hero: {
      padding: 20,
      paddingBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    heroMeta: { flexDirection: "row", gap: 8, marginBottom: 14 },
    chip: {
      paddingHorizontal: 10, paddingVertical: 4,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipText: { fontSize: 12, color: colors.mutedForeground },
    heroTitle: {
      fontSize: 24, fontWeight: "700",
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
      lineHeight: 30,
      marginBottom: 6,
    },
    heroSubtitle: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20 },
    heroIntro: { fontSize: 14, color: colors.foreground, lineHeight: 22, marginTop: 12 },
    section: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
    sectionHeading: {
      flex: 1, fontSize: 16, fontWeight: "700",
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    sectionBody: { fontSize: 14, color: colors.foreground, lineHeight: 22, marginBottom: 10 },
    bullet: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 4 },
    bulletDot: {
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: colors.accent,
      marginTop: 7,
    },
    bulletText: { flex: 1, fontSize: 13, color: colors.foreground, lineHeight: 20 },
    blockHeader: {
      paddingHorizontal: 20, paddingVertical: 14,
      backgroundColor: colors.muted,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    blockHeaderText: {
      fontSize: 12, fontWeight: "700",
      letterSpacing: 1, textTransform: "uppercase",
      color: colors.mutedForeground,
    },
    vocabRow: {
      paddingHorizontal: 20, paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      gap: 12,
    },
    vocabTerm: {
      fontSize: 14, fontWeight: "700",
      color: colors.accent,
      fontFamily: "PlusJakartaSans_700Bold",
      minWidth: 110,
    },
    vocabMeaning: { flex: 1, fontSize: 13, color: colors.foreground, lineHeight: 20 },
    quizCard: { padding: 20 },
    quizQ: { fontSize: 16, fontWeight: "600", color: colors.foreground, lineHeight: 24, marginBottom: 16 },
    optionBtn: {
      flexDirection: "row", alignItems: "center", gap: 12,
      padding: 14, borderRadius: colors.radius,
      borderWidth: 1.5, borderColor: colors.border,
      marginBottom: 10,
    },
    optionText: { flex: 1, fontSize: 14, color: colors.foreground },
    optionCircle: {
      width: 24, height: 24, borderRadius: 12,
      alignItems: "center", justifyContent: "center",
      backgroundColor: colors.muted,
    },
    explanation: {
      padding: 14, borderRadius: 12,
      backgroundColor: colors.muted,
      marginTop: 8,
    },
    explanationText: { fontSize: 13, color: colors.foreground, lineHeight: 20 },
    nextBtn: {
      marginTop: 16, padding: 14, borderRadius: 100,
      alignItems: "center",
      backgroundColor: colors.accent,
    },
    nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    scoreCard: {
      padding: 24, alignItems: "center", gap: 8,
    },
    scoreEmoji: { fontSize: 40 },
    scoreTitle: {
      fontSize: 20, fontWeight: "700",
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    scoreSub: { fontSize: 14, color: colors.mutedForeground, textAlign: "center" },
    retryBtn: {
      marginTop: 12, paddingHorizontal: 24, paddingVertical: 12,
      borderRadius: 100, borderWidth: 1.5, borderColor: colors.accent,
    },
    retryBtnText: { color: colors.accent, fontWeight: "700" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFoundTitle: { fontSize: 20, fontWeight: "700", color: colors.foreground },
    notFoundSub: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
    shapeScroll: { paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
    shapeCard: {
      width: 100, alignItems: "center", gap: 6,
      backgroundColor: colors.card,
      borderRadius: 14, padding: 12,
      borderWidth: 1, borderColor: colors.border,
    },
    shapeCardLabel: {
      fontSize: 11, fontWeight: "700", color: colors.foreground,
      textAlign: "center",
      fontFamily: "PlusJakartaSans_700Bold",
    },
    shapeCardType: { fontSize: 10, color: colors.mutedForeground, textTransform: "capitalize" },
    shareBtn: { padding: 6 },
  });

  if (loading) {
    return (
      <View style={[s.container, s.center]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!stored) {
    return (
      <View style={[s.container, s.center]}>
        <Text style={s.notFoundTitle}>Materi tidak ditemukan</Text>
        <Text style={s.notFoundSub}>Mungkin sudah dihapus</Text>
        <Pressable style={{ marginTop: 16 }} onPress={() => router.back()}>
          <Text style={{ color: colors.accent, fontWeight: "700" }}>← Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const { lesson } = stored;
  const quiz = lesson.quiz || [];
  const currentQ = quiz[quizIndex];

  function handleAnswer(idx: number) {
    if (quizAnswer !== null) return;
    setQuizAnswer(idx);
    if (idx === currentQ.correctIndex) {
      setQuizScore((s) => s + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function nextQuestion() {
    if (quizIndex < quiz.length - 1) {
      setQuizIndex((i) => i + 1);
      setQuizAnswer(null);
    } else {
      setQuizDone(true);
    }
  }

  function retryQuiz() {
    setQuizIndex(0);
    setQuizAnswer(null);
    setQuizScore(0);
    setQuizDone(false);
  }

  function getOptionStyle(optIdx: number) {
    if (quizAnswer === null) return s.optionBtn;
    if (optIdx === currentQ.correctIndex)
      return [s.optionBtn, { borderColor: "#7BBD81", backgroundColor: "#7BBD8122" }];
    if (optIdx === quizAnswer && optIdx !== currentQ.correctIndex)
      return [s.optionBtn, { borderColor: "#C94A2F", backgroundColor: "#C94A2F22" }];
    return [s.optionBtn, { opacity: 0.5 }];
  }

  return (
    <View style={s.container}>
      <View style={s.navBar}>
        <Pressable style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={s.navTitle} numberOfLines={1}>{stored.topic}</Text>
        <Pressable
          style={s.shareBtn}
          onPress={() => Share.share({ title: lesson.title, message: `${lesson.title}\n${lesson.subtitle}\n\nDibuat dengan Lectra` })}
        >
          <Ionicons name="share-outline" size={22} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Hero */}
        <View style={s.hero}>
          <View style={s.heroMeta}>
            <View style={s.chip}><Text style={s.chipText}>{lesson.level}</Text></View>
            <View style={s.chip}><Text style={s.chipText}>{lesson.duration}</Text></View>
          </View>
          <Text style={s.heroTitle}>{lesson.title}</Text>
          <Text style={s.heroSubtitle}>{lesson.subtitle}</Text>
          {!!lesson.intro && <Text style={s.heroIntro}>{lesson.intro}</Text>}
        </View>

        {/* Sections */}
        {lesson.sections?.map((sec, i) => (
          <View key={i} style={s.section}>
            <View style={s.sectionHeader}>
              <ShapeIcon type={sec.shape?.type ?? "sphere"} color={sec.shape?.color ?? colors.accent} size={40} />
              <Text style={s.sectionHeading}>{sec.heading}</Text>
            </View>
            <Text style={s.sectionBody}>{sec.body}</Text>
            {sec.bullets?.map((b, j) => (
              <View key={j} style={s.bullet}>
                <View style={s.bulletDot} />
                <Text style={s.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* 3D Model Gallery */}
        {(lesson.sections?.length ?? 0) > 0 && (
          <>
            <View style={s.blockHeader}>
              <Text style={s.blockHeaderText}>Model 3D</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.shapeScroll}>
              {lesson.sections.map((sec, i) => (
                <View key={i} style={s.shapeCard}>
                  <ShapeIcon
                    type={sec.shape?.type ?? "sphere"}
                    color={sec.shape?.color ?? colors.accent}
                    size={56}
                  />
                  <Text style={s.shapeCardLabel} numberOfLines={2}>{sec.shape?.label ?? sec.heading}</Text>
                  <Text style={s.shapeCardType}>{sec.shape?.type}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Vocabulary */}
        {(lesson.vocabulary?.length ?? 0) > 0 && (
          <>
            <View style={s.blockHeader}><Text style={s.blockHeaderText}>Kosakata</Text></View>
            {lesson.vocabulary.map((v, i) => (
              <View key={i} style={s.vocabRow}>
                <Text style={s.vocabTerm}>{v.term}</Text>
                <Text style={s.vocabMeaning}>{v.meaning}</Text>
              </View>
            ))}
          </>
        )}

        {/* Quiz */}
        {quiz.length > 0 && (
          <>
            <View style={s.blockHeader}>
              <Text style={s.blockHeaderText}>
                Quiz {quizDone ? "" : `${quizIndex + 1}/${quiz.length}`}
              </Text>
            </View>
            {quizDone ? (
              <View style={s.scoreCard}>
                <Text style={s.scoreEmoji}>{quizScore === quiz.length ? "🎉" : quizScore >= quiz.length / 2 ? "👍" : "📚"}</Text>
                <Text style={s.scoreTitle}>{quizScore}/{quiz.length} Benar</Text>
                <Text style={s.scoreSub}>
                  {quizScore === quiz.length
                    ? "Sempurna! Kamu menguasai materi ini."
                    : quizScore >= quiz.length / 2
                    ? "Bagus! Terus berlatih."
                    : "Coba lagi untuk meningkatkan pemahaman."}
                </Text>
                <Pressable style={s.retryBtn} onPress={retryQuiz}>
                  <Text style={s.retryBtnText}>Ulangi Quiz</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.quizCard}>
                <Text style={s.quizQ}>{currentQ.question}</Text>
                {currentQ.options.map((opt, idx) => (
                  <Pressable
                    key={idx}
                    style={getOptionStyle(idx)}
                    onPress={() => handleAnswer(idx)}
                    disabled={quizAnswer !== null}
                  >
                    <View style={s.optionCircle}>
                      {quizAnswer !== null && idx === currentQ.correctIndex ? (
                        <Ionicons name="checkmark" size={14} color="#7BBD81" />
                      ) : quizAnswer === idx && idx !== currentQ.correctIndex ? (
                        <Ionicons name="close" size={14} color="#C94A2F" />
                      ) : (
                        <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                          {String.fromCharCode(65 + idx)}
                        </Text>
                      )}
                    </View>
                    <Text style={s.optionText}>{opt}</Text>
                  </Pressable>
                ))}
                {quizAnswer !== null && (
                  <>
                    {currentQ.explanation ? (
                      <View style={s.explanation}>
                        <Text style={s.explanationText}>{currentQ.explanation}</Text>
                      </View>
                    ) : null}
                    <Pressable style={s.nextBtn} onPress={nextQuestion}>
                      <Text style={s.nextBtnText}>
                        {quizIndex < quiz.length - 1 ? "Soal Berikutnya →" : "Lihat Hasil"}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
