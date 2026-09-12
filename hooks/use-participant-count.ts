"use client";

import { useEffect, useState, useCallback } from "react";

const PARTICIPANT_COUNT_EVENT = "typester:participant_count_updated";

export function useParticipantCount() {
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/participants", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === "number") {
          setCount(data.count);
        }
      }
    } catch {
      // Ignore network errors
    }
  }, []);

  useEffect(() => {
    fetchCount();

    const handleUpdate = (e: CustomEvent<number>) => {
      if (typeof e.detail === "number") {
        setCount(e.detail);
      }
    };

    window.addEventListener(
      PARTICIPANT_COUNT_EVENT,
      handleUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        PARTICIPANT_COUNT_EVENT,
        handleUpdate as EventListener
      );
    };
  }, [fetchCount]);

  const recordCompletion = useCallback(async () => {
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.count === "number") {
          setCount(data.count);
          window.dispatchEvent(
            new CustomEvent(PARTICIPANT_COUNT_EVENT, { detail: data.count })
          );
        }
      }
    } catch {
      // Fallback local increment
      setCount((prev) => (prev !== null ? prev + 1 : 1));
    }
  }, []);

  return { count, recordCompletion, refreshCount: fetchCount };
}

export function notifyTestCompleted() {
  if (typeof window === "undefined") return;
  fetch("/api/participants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      if (typeof data.count === "number") {
        window.dispatchEvent(
          new CustomEvent(PARTICIPANT_COUNT_EVENT, { detail: data.count })
        );
      }
    })
    .catch(() => {
      // Ignore failure
    });
}
