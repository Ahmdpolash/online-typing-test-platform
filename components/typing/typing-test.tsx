"use client";

import { ArrowCounterClockwise, Cursor } from "@phosphor-icons/react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "@/components/settings/settings-provider";
import { ResultsScreen } from "@/components/typing/results";
import { TestControls } from "@/components/typing/test-controls";
import { WordItem } from "@/components/typing/word-item";
import { useTypingTest } from "@/hooks/use-typing-test";
import { cn } from "@/lib/utils";

interface TypingTestProps {
  onFinished?: (finished: boolean) => void;
  onFocusChange?: (focused: boolean) => void;
  onKeyHighlight?: (key: string | null) => void;
  onTypingActiveChange?: (active: boolean) => void;
  pauseTypingInputRefocus?: boolean;
}

const FONT_SIZE_STYLES = {
  small: "text-xl leading-[2.6rem] h-[7.8rem]",
  medium: "text-2xl leading-[2.8rem] h-[8.4rem]",
  large: "text-3xl leading-[3.2rem] h-[9.6rem]",
  xlarge: "text-4xl leading-[3.8rem] h-[11.4rem]",
};

const FONT_WEIGHT_STYLES = {
  normal: "font-normal",
  medium: "font-medium",
  bold: "font-bold",
};

export function TypingTest(props: TypingTestProps) {
  const {
    liveStats,
    faahMode,
    ghostMode,
    soundVolume,
    soundEnabled,
    fontSize,
    fontWeight,
  } = useSettings();
  const faahAudioRef = useRef<HTMLAudioElement | null>(null);

  const onWrongKey = useCallback(() => {
    if (!faahMode || !soundEnabled) return;
    if (!faahAudioRef.current) {
      faahAudioRef.current = new Audio("/sounds/fahhhhh.mp3");
    }
    // Scale volume down gently to avoid headphone ear fatigue (max ~20% of master volume)
    faahAudioRef.current.volume = Math.max(0, Math.min(1, soundVolume * 0.2));
    faahAudioRef.current.currentTime = 0;
    void faahAudioRef.current.play();
  }, [faahMode, soundEnabled, soundVolume]);

  const {
    mode, timeOption, wordOption, quoteLength,
    punctuation, numbers, difficulty,
    words, typed, wordIndex, started, rowOffset,
    timeLeft, wordInputs, isFocused, resetting,
    isActivelyTyping, screenFade, wpm, accuracy,
    controlsVisible, showResults, frozenStats,
    inputRef, wordsContainerRef, activeWordRef,
    handleKeyDown, handleFocus, handleInputBlur, handleInputFocus,
    handleMouseMove, handleResultsRestart, handleResultsNext,
    onModeChange, onTimeOptionChange, onWordOptionChange,
    onQuoteLengthChange, onPunctuationToggle, onNumbersToggle,
    onDifficultyToggle, onRestart,
  } = useTypingTest({ ...props, onWrongKey });

  // Global F5 key listener to restart test instantly instead of browser refresh
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        if (showResults) {
          handleResultsRestart();
        } else {
          onRestart();
        }
        return;
      }
      if (!isFocused && !showResults && inputRef.current) {
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isFocused, showResults, inputRef, onRestart, handleResultsRestart]);

  if (showResults) {
    return (
      <div
        className="w-full transition-all duration-150 ease-out"
        style={{
          opacity: screenFade,
          filter: screenFade < 1 ? "blur(4px)" : "none",
        }}
      >
        <ResultsScreen
          onNext={handleResultsNext}
          onRestart={handleResultsRestart}
          stats={frozenStats!}
        />
      </div>
    );
  }

  let wordsOpacity = 1;
  if (resetting) {
    wordsOpacity = 0;
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard focus handled via global keydown
    // biome-ignore lint/a11y/noStaticElementInteractions: intentional click-to-focus area
    <div
      className="flex w-full max-w-[1240px] flex-col items-center gap-4 px-2 transition-all duration-150 ease-out sm:px-6"
      onClick={handleFocus}
      onMouseMove={handleMouseMove}
      style={{
        opacity: screenFade,
        filter: screenFade < 1 ? "blur(4px)" : "none",
      }}
    >
      {/* Controls toolbar */}
      <TestControls
        controlsVisible={controlsVisible}
        difficulty={difficulty}
        mode={mode}
        numbers={numbers}
        onDifficultyToggle={onDifficultyToggle}
        onModeChange={onModeChange}
        onNumbersToggle={onNumbersToggle}
        onPunctuationToggle={onPunctuationToggle}
        onQuoteLengthChange={onQuoteLengthChange}
        onRestart={onRestart}
        onTimeOptionChange={onTimeOptionChange}
        onWordOptionChange={onWordOptionChange}
        punctuation={punctuation}
        quoteLength={quoteLength}
        timeOption={timeOption}
        wordOption={wordOption}
      />

      {/* Words display */}
      <div className="relative w-full">
        {/* Live stats bar */}
        <motion.div
          animate={{ opacity: resetting ? 0 : 1 }}
          className="mb-4 flex min-h-8 items-center justify-between"
          transition={{ duration: 0.15 }}
        >
          <div className="flex-1" />
          <div
            className={cn(
              "flex items-baseline gap-6 transition-opacity duration-200",
              started ? "opacity-100" : "opacity-0"
            )}
          >
            {mode === "time" && (
              <span className="tabular-nums">
                <span className="font-bold text-foreground text-lg">{timeLeft}</span>
                <span className="ml-0.5 text-muted-foreground text-xs">s</span>
              </span>
            )}
            {mode === "words" && (
              <span className="tabular-nums">
                <span className="font-bold text-foreground text-lg">{wordIndex}</span>
                <span className="text-muted-foreground text-xs">/{wordOption}</span>
              </span>
            )}
            {liveStats && (
              <>
                <span className="tabular-nums">
                  <span className="font-bold text-foreground text-lg">{wpm}</span>
                  <span className="ml-0.5 text-muted-foreground text-xs">wpm</span>
                </span>
                <span className="tabular-nums">
                  <span className="font-bold text-foreground text-lg">{accuracy}</span>
                  <span className="text-muted-foreground text-xs">% acc</span>
                </span>
              </>
            )}
          </div>
        </motion.div>

        <div
          className={cn(
            "relative w-full overflow-hidden leading-relaxed transition-all duration-150",
            FONT_SIZE_STYLES[fontSize] ?? FONT_SIZE_STYLES.medium,
            FONT_WEIGHT_STYLES[fontWeight] ?? FONT_WEIGHT_STYLES.normal,
            isActivelyTyping && "is-typing"
          )}
          ref={wordsContainerRef}
          style={{ fontFamily: "var(--typing-font)" }}
        >
          {/* Hidden capture input */}
          <input
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            autoFocus
            className="absolute opacity-0"
            onBlur={handleInputBlur}
            onChange={() => { /* controlled via onKeyDown */ }}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            spellCheck={false}
            value={typed}
          />

          <LayoutGroup id="words">
            <motion.div
              animate={{
                y: -rowOffset,
                opacity: wordsOpacity,
                filter: resetting ? "blur(4px)" : "blur(0px)",
              }}
              className="flex flex-wrap gap-x-2.5 gap-y-0"
              transition={
                resetting
                  ? { duration: 0.15, ease: "easeOut" }
                  : { type: "spring", stiffness: 300, damping: 30, mass: 0.8 }
              }
            >
              {words.map((word, wIdx) => {
                const isActive = wIdx === wordIndex;
                const isPast = wIdx < wordIndex;
                const isFuture = !(isActive || isPast);
                let displayInput = "";
                if (isActive) displayInput = typed;
                else if (isPast) displayInput = wordInputs[wIdx] ?? "";
                const hasError = isPast && wordInputs[wIdx] !== word;
                const currentWordDone =
                  typed.length >= (words[wordIndex]?.length ?? 0);
                const isNextWord = wIdx === wordIndex + 1;
                const dimmed =
                  ghostMode &&
                  isFocused &&
                  isFuture &&
                  !(currentWordDone && isNextWord);

                return (
                  <WordItem
                    dimmed={dimmed}
                    displayInput={displayInput}
                    elemRef={activeWordRef}
                    hasError={hasError}
                    isActive={isActive}
                    isPast={isPast}
                    key={wIdx}
                    word={word}
                  />
                );
              })}
            </motion.div>
          </LayoutGroup>
        </div>

        {/* Unfocused overlay */}
        <AnimatePresence>
          {!isFocused && !resetting && (
            <motion.div
              animate={{ opacity: 1 }}
              className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#26282d]/85 px-5 py-2 font-medium text-foreground text-sm shadow-xl backdrop-blur-md">
                <Cursor className="text-primary" size={16} weight="duotone" />
                <span>Click or press any key to focus</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom row: restart hint */}
      <motion.div
        animate={{ opacity: controlsVisible ? 1 : 0 }}
        className={cn(
          "flex items-center gap-4",
          !controlsVisible && "pointer-events-none select-none"
        )}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
        <button
          aria-label="Restart test"
          className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted-foreground text-xs transition-colors hover:bg-white/[0.05] hover:text-foreground"
          onClick={onRestart}
          type="button"
        >
          <ArrowCounterClockwise size={14} weight="duotone" />
          restart
        </button>
        <span className="text-muted-foreground/60 text-xs">
          tab + enter or f5 to reset
        </span>
      </motion.div>
    </div>
  );
}
