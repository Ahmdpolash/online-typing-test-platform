const SOUND_URL = "/sounds/sound.ogg";

let cachedBuffer: ArrayBuffer | null = null;
let fetchPromise: Promise<ArrayBuffer | null> | null = null;

function startFetch(): Promise<ArrayBuffer | null> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch(SOUND_URL)
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .then((ab) => {
      cachedBuffer = ab;
      return ab;
    })
    .catch(() => null);
  return fetchPromise;
}

// Start immediately on import
if (typeof window !== "undefined") {
  startFetch();
}

export function getSoundBuffer(): Promise<ArrayBuffer | null> {
  if (cachedBuffer) return Promise.resolve(cachedBuffer);
  return startFetch();
}
