// Key format: "tb-pb-{mode}-{detail}" e.g. "tb-pb-time-30"
const PB_PREFIX = "tb-pb-";

export interface PersonalBest {
  accuracy: number;
  date: string;
  wpm: number;
}

function pbKey(mode: string, detail: string): string {
  return `${PB_PREFIX}${mode}-${detail}`;
}

export function getPersonalBest(
  mode: string,
  detail: string
): PersonalBest | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(pbKey(mode, detail));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersonalBest;
  } catch {
    return null;
  }
}

export function saveIfPersonalBest(
  mode: string,
  detail: string,
  wpm: number,
  accuracy: number
): { isNewPb: boolean; previous: PersonalBest | null } {
  const prev = getPersonalBest(mode, detail);
  if (!prev || wpm > prev.wpm) {
    localStorage.setItem(
      pbKey(mode, detail),
      JSON.stringify({ wpm, accuracy, date: new Date().toISOString() })
    );
    return { isNewPb: true, previous: prev };
  }
  return { isNewPb: false, previous: prev };
}
