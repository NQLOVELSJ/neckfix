import { createClient } from "@/lib/supabase/client";

export interface TrainingRecord {
  date: string; // YYYY-MM-DD
  duration: number; // seconds
  exercisesCompleted: number;
  severity: string;
  overallScore: number;
}

const STORAGE_KEY = "neckfix_records";
const MIGRATION_KEY = "neckfix_migrated";

// ── localStorage sync helpers (guest mode / fallback) ──

function lsGet(): TrainingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function lsSet(records: TrainingRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ── Sync API (for non-authenticated users) ──

export function getRecords(): TrainingRecord[] {
  return lsGet();
}

export function saveRecord(record: TrainingRecord): void {
  const records = lsGet();
  records.push(record);
  lsSet(records);
}

export function getRecordsByDate(date: string): TrainingRecord[] {
  return lsGet().filter((r) => r.date === date);
}

export function getStreakDays(): number {
  const records = lsGet();
  const dates = [...new Set(records.map((r) => r.date))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (const dateStr of dates) {
    const d = new Date(dateStr);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - streak);
    if (d.toDateString() === expected.toDateString()) {
      streak++;
    } else if (d < expected) {
      break;
    }
  }
  return streak;
}

export function getMonthlyStats(year: number, month: number): Map<string, TrainingRecord[]> {
  const records = lsGet();
  const map = new Map<string, TrainingRecord[]>();
  for (const r of records) {
    const [y, m] = r.date.split("-").map(Number);
    if (y === year && m === month) {
      const existing = map.get(r.date) || [];
      existing.push(r);
      map.set(r.date, existing);
    }
  }
  return map;
}

export function getTotalStats(): {
  totalSessions: number;
  totalMinutes: number;
  avgScore: number;
  streakDays: number;
} {
  const records = lsGet();
  return {
    totalSessions: records.length,
    totalMinutes: Math.round(records.reduce((sum, r) => sum + r.duration, 0) / 60),
    avgScore: records.length
      ? Math.round(records.reduce((sum, r) => sum + r.overallScore, 0) / records.length)
      : 0,
    streakDays: getStreakDays(),
  };
}

// ── Async API (for authenticated users, Supabase backend) ──

async function getUserId(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getRecordsAsync(): Promise<TrainingRecord[]> {
  const userId = await getUserId();
  if (!userId) return lsGet();

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("training_records")
      .select("date, duration, exercises_completed, severity, overall_score")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error || !data) return lsGet();

    return (data as any[]).map((r) => ({
      date: r.date,
      duration: r.duration,
      exercisesCompleted: r.exercises_completed,
      severity: r.severity,
      overallScore: r.overall_score,
    }));
  } catch {
    return lsGet();
  }
}

export async function saveRecordAsync(record: TrainingRecord): Promise<void> {
  const userId = await getUserId();
  if (!userId) {
    saveRecord(record);
    return;
  }

  try {
    const supabase = createClient();
    await supabase.from("training_records").insert({
      user_id: userId,
      date: record.date,
      duration: record.duration,
      exercises_completed: record.exercisesCompleted,
      severity: record.severity,
      overall_score: record.overallScore,
    });
  } catch {
    // Fallback to localStorage
    saveRecord(record);
  }
}

export async function getTotalStatsAsync(): Promise<{
  totalSessions: number;
  totalMinutes: number;
  avgScore: number;
  streakDays: number;
}> {
  const records = await getRecordsAsync();
  return {
    totalSessions: records.length,
    totalMinutes: Math.round(records.reduce((sum, r) => sum + r.duration, 0) / 60),
    avgScore: records.length
      ? Math.round(records.reduce((sum, r) => sum + r.overallScore, 0) / records.length)
      : 0,
    streakDays: computeStreakFrom(records),
  };
}

function computeStreakFrom(records: TrainingRecord[]): number {
  const dates = [...new Set(records.map((r) => r.date))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (const dateStr of dates) {
    const d = new Date(dateStr);
    const expected = new Date(today);
    expected.setDate(expected.getDate() - streak);
    if (d.toDateString() === expected.toDateString()) {
      streak++;
    } else if (d < expected) {
      break;
    }
  }
  return streak;
}

// ── Data migration ──

export async function migrateLocalToSupabase(): Promise<number> {
  if (typeof window === "undefined") return 0;
  if (localStorage.getItem(MIGRATION_KEY) === "done") return 0;

  const userId = await getUserId();
  if (!userId) return 0;

  const records = lsGet();
  if (records.length === 0) {
    localStorage.setItem(MIGRATION_KEY, "done");
    return 0;
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("training_records").insert(
      records.map((r) => ({
        user_id: userId,
        date: r.date,
        duration: r.duration,
        exercises_completed: r.exercisesCompleted,
        severity: r.severity,
        overall_score: r.overallScore,
      })),
    );

    if (!error) {
      localStorage.setItem(MIGRATION_KEY, "done");
      return records.length;
    }
    return 0;
  } catch {
    return 0;
  }
}
