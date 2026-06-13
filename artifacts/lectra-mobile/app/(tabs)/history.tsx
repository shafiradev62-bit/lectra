import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, Pressable, Alert, Platform,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { listLessons, deleteLesson, type StoredLesson } from "@/lib/lesson-storage";
import ShapeIcon from "@/components/ShapeIcon";

function relativeTime(ts: number, locale: string): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (locale === "id") {
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    if (hours < 24) return `${hours} jam lalu`;
    return `${days} hari lalu`;
  }
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [lessons, setLessons] = useState<StoredLesson[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const locale = "id";

  const load = useCallback(async () => {
    const data = await listLessons();
    setLessons(data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onDelete = (id: string, topic: string) => {
    Alert.alert(
      locale === "id" ? "Hapus Materi" : "Delete Lesson",
      locale === "id" ? `Hapus "${topic}"?` : `Delete "${topic}"?`,
      [
        { text: locale === "id" ? "Batal" : "Cancel", style: "cancel" },
        {
          text: locale === "id" ? "Hapus" : "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteLesson(id);
            await load();
          },
        },
      ]
    );
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    headerSub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    list: { paddingHorizontal: 16, paddingTop: 12 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
      gap: 12,
    },
    cardContent: { flex: 1 },
    cardTopic: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    cardTitle: { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
    cardMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
    chip: {
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 8,
      backgroundColor: colors.muted,
    },
    chipText: { fontSize: 11, color: colors.mutedForeground },
    deleteBtn: { padding: 6 },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 60,
      gap: 12,
    },
    emptyIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    emptyText: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", paddingHorizontal: 40 },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.headerTitle}>{locale === "id" ? "Koleksi Saya" : "My Lessons"}</Text>
        <Text style={s.headerSub}>
          {lessons.length} {locale === "id" ? "materi tersimpan" : "saved lessons"}
        </Text>
      </View>

      {lessons.length === 0 ? (
        <View style={s.empty}>
          <View style={s.emptyIcon}>
            <Ionicons name="library-outline" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={s.emptyTitle}>{locale === "id" ? "Belum ada materi" : "No lessons yet"}</Text>
          <Text style={s.emptyText}>
            {locale === "id"
              ? "Buat materi 3D pertamamu di tab Buat"
              : "Create your first 3D lesson in the Create tab"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={lessons}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          renderItem={({ item }) => {
            const shape = item.lesson?.sections?.[0]?.shape;
            return (
              <Pressable
                style={({ pressed }) => [s.card, { opacity: pressed ? 0.75 : 1 }]}
                onPress={() => router.push(`/lesson/${item.id}` as any)}
              >
                <ShapeIcon
                  type={shape?.type ?? "sphere"}
                  color={shape?.color ?? colors.accent}
                  size={46}
                />
                <View style={s.cardContent}>
                  <Text style={s.cardTopic} numberOfLines={1}>{item.topic}</Text>
                  <Text style={s.cardTitle} numberOfLines={1}>{item.lesson?.title}</Text>
                  <View style={s.cardMeta}>
                    <View style={s.chip}>
                      <Text style={s.chipText}>{item.lesson?.level}</Text>
                    </View>
                    <Text style={s.chipText}>{relativeTime(item.createdAt, locale)}</Text>
                  </View>
                </View>
                <Pressable style={s.deleteBtn} onPress={() => onDelete(item.id, item.topic)}>
                  <Ionicons name="trash-outline" size={18} color={colors.mutedForeground} />
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
