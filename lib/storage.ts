import type { PoseAnalysis } from "./pose-analyzer";

export interface TrainingRecord {
  date: string; // YYYY-MM-DD
  duration: number; // seconds
  exercisesCompleted: number;
  severity: string;
  overallScore: number;
}

const STORAGE_KEY = "neckfix_records";

export function getRecords(): TrainingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: TrainingRecord): void {
  const records = getRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getRecordsByDate(date: string): TrainingRecord[] {
  return getRecords().filter((r) => r.date === date);
}

export function getStreakDays(): number {
  const records = getRecords();
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
  const records = getRecords();
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
  const records = getRecords();
  return {
    totalSessions: records.length,
    totalMinutes: Math.round(
      records.reduce((sum, r) => sum + r.duration, 0) / 60
    ),
    avgScore: records.length
      ? Math.round(records.reduce((sum, r) => sum + r.overallScore, 0) / records.length)
      : 0,
    streakDays: getStreakDays(),
  };
}
