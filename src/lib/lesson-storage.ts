import type { Lesson } from "./lesson-generator";

const KEY = "lectra:lessons";

export interface StoredLesson {
  id: string;
  topic: string;
  createdAt: number;
  lesson: Lesson;
}

function read(): StoredLesson[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(KEY);
      return [];
    }
    // Validate each lesson
    const valid = parsed.filter(item => 
      item && 
      typeof item.id === "string" && 
      typeof item.topic === "string" && 
      typeof item.createdAt === "number" && 
      item.lesson
    );
    // If we had to filter out invalid data, rewrite localStorage
    if (valid.length !== parsed.length) {
      write(valid);
    }
    return valid;
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
}

function write(items: StoredLesson[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Ignore write errors
  }
}

export function saveLesson(topic: string, lesson: Lesson): StoredLesson {
  const id = Math.random().toString(36).slice(2, 10);
  const entry: StoredLesson = { id, topic, createdAt: Date.now(), lesson };
  const items = read();
  items.unshift(entry);
  write(items.slice(0, 50));
  return entry;
}

export function getLesson(id: string): StoredLesson | null {
  try {
    return read().find((l) => l.id === id) ?? null;
  } catch {
    return null;
  }
}

export function listLessons(): StoredLesson[] {
  try {
    return read();
  } catch {
    return [];
  }
}

export function deleteLesson(id: string): void {
  try {
    const items = read().filter((l) => l.id !== id);
    write(items);
  } catch {
    // Ignore delete errors
  }
}
