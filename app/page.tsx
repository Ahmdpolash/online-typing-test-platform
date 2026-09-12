"use client";

import { useCallback, useEffect, useState } from "react";
import { useAppChrome } from "@/components/layout/app-chrome";
import { useSettings } from "@/components/settings/settings-provider";
import { TypingTest } from "@/components/typing/typing-test";
import { Keyboard } from "@/components/ui/keyboard";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function Page() {
  const { settingsOpen, setTypingActive, homeLogoHandlerRef } = useAppChrome();
  const [isFinished, setIsFinished] = useState(false);
  const [typingFocused, setTypingFocused] = useState(true);
  const [restartKey, setRestartKey] = useState(0);
  const { showKeyboard, soundEnabled, soundVolume, accent } = useSettings();

  useEffect(() => {
    homeLogoHandlerRef.current = () => {
      setIsFinished(false);
      setRestartKey((k) => k + 1);
    };
    return () => {
      homeLogoHandlerRef.current = null;
    };
  }, [homeLogoHandlerRef]);

  const handleTypingActiveChange = useCallback(
    (active: boolean) => {
      setTypingActive(active);
    },
    [setTypingActive]
  );

  const handleKeyHighlight = useCallback((_key: string | null) => {
    /* no-op — keyboard handles its own highlight via physical key events */
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <main
        className={cn(
          "flex flex-col px-4 sm:px-6 lg:px-8",
          isFinished
            ? "flex-1 justify-center px-6 py-2 sm:px-10"
            : "flex-1 items-center justify-center"
        )}
      >
        <TypingTest
          key={restartKey}
          onFinished={setIsFinished}
          onFocusChange={setTypingFocused}
          onKeyHighlight={handleKeyHighlight}
          onTypingActiveChange={handleTypingActiveChange}
          pauseTypingInputRefocus={settingsOpen}
        />
      </main>

      {!isFinished && (
        <footer
          className={cn(
            "hidden items-center justify-center lg:flex",
            showKeyboard
              ? "flex-col pb-4"
              : "invisible h-0 overflow-hidden border-0"
          )}
        >
          <div className="scale-[0.85]">
            <Keyboard
              enableHaptics
              enableSound={soundEnabled}
              forceActive={soundEnabled && !showKeyboard}
              physicalKeysEnabled={typingFocused}
              theme={accent}
              volume={soundVolume}
            />
          </div>
          <p className="text-muted-foreground/40 text-xs">
            Built with ❤️ by{" "}
            <a
              className="text-muted-foreground/60 underline-offset-2 hover:text-foreground hover:underline"
              href={siteConfig.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              Typester
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}
