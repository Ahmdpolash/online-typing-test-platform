"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const PARTICIPANT_COUNT_EVENT = "typester:participant_count_updated";

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let id = sessionStorage.getItem("typester_sid");
    if (!id) {
      id = "sess_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      sessionStorage.setItem("typester_sid", id);
    }
    return id;
  } catch {
    return "sess_anon";
  }
}

export function useParticipantCount() {
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const sessionIdRef = useRef<string>("");

  const pingPresence = useCallback(async () => {
    try {
      const sid = sessionIdRef.current || getSessionId();
      sessionIdRef.current = sid;
      const res = await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.completed === "number") {
          setCompletedCount(data.completed);
        }
        if (typeof data.online === "number") {
          setOnlineCount(data.online);
        }
      }
    } catch {
      // Ignore network errors
    }
  }, []);

  useEffect(() => {
    sessionIdRef.current = getSessionId();
    pingPresence();

    // Heartbeat every 12 seconds for realtime online presence
    const interval = setInterval(pingPresence, 12_000);

    const handleUpdate = (e: CustomEvent<number>) => {
      if (typeof e.detail === "number") {
        setCompletedCount(e.detail);
      }
    };

    window.addEventListener(
      PARTICIPANT_COUNT_EVENT,
      handleUpdate as EventListener
    );

    // Remove presence on unload
    const handleBeforeUnload = () => {
      try {
        const sid = sessionIdRef.current;
        if (sid && navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/presence",
            new Blob([JSON.stringify({ sessionId: sid })], {
              type: "application/json",
            })
          );
        }
      } catch {
        // Ignore
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        PARTICIPANT_COUNT_EVENT,
        handleUpdate as EventListener
      );
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pingPresence]);

  return { completedCount, onlineCount, refresh: pingPresence };
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
      // Ignore
    });
}
