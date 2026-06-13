import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Lesson } from "./lesson-generator";

const KEY = "lectra:lessons";

export interface StoredLesson {
  id: string;
  topic: string;
  createdAt: number;
  lesson: Lesson;
}

async function readAll(): Promise<StoredLesson[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item: any) =>
        item &&
        typeof item.id === "string" &&
        typeof item.topic === "string" &&
        typeof item.createdAt === "number" &&
        item.lesson
    );
  } catch {
    return [];
  }
}

async function writeAll(items: StoredLesson[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // ignore write errors
  }
}

export async function saveLesson(topic: string, lesson: Lesson): Promise<StoredLesson> {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const entry: StoredLesson = { id, topic, createdAt: Date.now(), lesson };
  const items = await readAll();
  items.unshift(entry);
  await writeAll(items.slice(0, 50));
  return entry;
}

export async function getLesson(id: string): Promise<StoredLesson | null> {
  const items = await readAll();
  return items.find((l) => l.id === id) ?? null;
}

export async function listLessons(): Promise<StoredLesson[]> {
  return readAll();
}

export async function deleteLesson(id: string): Promise<void> {
  const items = await readAll();
  await writeAll(items.filter((l) => l.id !== id));
}
