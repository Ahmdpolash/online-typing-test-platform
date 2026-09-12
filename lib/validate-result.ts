import type { ResultStats, WpmSnapshot } from "@/lib/types";

export type InvalidReason =
  | "no_keystrokes"
  | "invalid_numbers"
  | "invalid_accuracy"
  | "zero_time"
  | "too_short"
  | "impossible_wpm"
  | "impossible_raw"
  | "impossible_cps"
  | "impossible_burst"
  | "flat_wpm_history"
  | "perfect_consistency"
  | "afk_detected";

export interface ValidationResult {
  reason?: InvalidReason;
  valid: boolean;
}

const MAX_WPM = 300;
const MAX_RAW_WPM = 350;
const MAX_CHARS_PER_SEC = 30;
const MAX_BURST_WPM = 600;
const MIN_ELAPSED_SECONDS = 2;
const MAX_CONSECUTIVE_ZERO_SECONDS = 3;
const MIN_HISTORY_FOR_STATS = 4;
const MIN_WPM_FOR_BOT_CHECKS = 80;

function isFlatHistory(history: WpmSnapshot[], wpm: number): boolean {
  if (history.length < MIN_HISTORY_FOR_STATS || wpm < MIN_WPM_FOR_BOT_CHECKS) {
    return false;
  }
  const values = history.map((s) => s.wpm);
  const spread = Math.max(...values) - Math.min(...values);
  return spread <= 1;
}

function hasPerfectConsistency(stats: ResultStats): boolean {
  if (
    stats.wpmHistory.length < MIN_HISTORY_FOR_STATS ||
    stats.wpm < MIN_WPM_FOR_BOT_CHECKS
  ) {
    return false;
  }
  return stats.consistency >= 99;
}

function hasImpossibleBurst(history: WpmSnapshot[]): boolean {
  return history.some((s) => s.wpm > MAX_BURST_WPM);
}

function detectAfk(history: WpmSnapshot[]): boolean {
  const inner = history.slice(1, -1);
  let consecutive = 0;
  for (const snap of inner) {
    if (snap.raw === 0) {
      consecutive++;
      if (consecutive > MAX_CONSECUTIVE_ZERO_SECONDS) {
        return true;
      }
    } else {
      consecutive = 0;
    }
  }
  return false;
}

export function validateResult(stats: ResultStats): ValidationResult {
  const {
    wpm,
    raw,
    accuracy,
    correctChars,
    incorrectChars,
    extraChars,
    elapsedSeconds,
    wpmHistory,
  } = stats;

  const keystrokes = correctChars + incorrectChars + extraChars;

  if (keystrokes === 0) return { valid: false, reason: "no_keystrokes" };

  if (!(Number.isFinite(wpm) && Number.isFinite(raw) && Number.isFinite(accuracy))) {
    return { valid: false, reason: "invalid_numbers" };
  }

  if (accuracy < 0 || accuracy > 100) return { valid: false, reason: "invalid_accuracy" };
  if (elapsedSeconds <= 0) return { valid: false, reason: "zero_time" };
  if (elapsedSeconds < MIN_ELAPSED_SECONDS) return { valid: false, reason: "too_short" };
  if (wpm > MAX_WPM) return { valid: false, reason: "impossible_wpm" };
  if (raw > MAX_RAW_WPM) return { valid: false, reason: "impossible_raw" };

  const cps = keystrokes / elapsedSeconds;
  if (cps > MAX_CHARS_PER_SEC) return { valid: false, reason: "impossible_cps" };

  if (wpmHistory.length > 0) {
    if (hasImpossibleBurst(wpmHistory)) return { valid: false, reason: "impossible_burst" };
    if (wpmHistory.length > MIN_HISTORY_FOR_STATS + 2 && detectAfk(wpmHistory)) {
      return { valid: false, reason: "afk_detected" };
    }
    if (isFlatHistory(wpmHistory, wpm)) return { valid: false, reason: "flat_wpm_history" };
    if (hasPerfectConsistency(stats)) return { valid: false, reason: "perfect_consistency" };
  }

  return { valid: true };
}

export function isInvalidTestResult(stats: ResultStats): boolean {
  return !validateResult(stats).valid;
}
