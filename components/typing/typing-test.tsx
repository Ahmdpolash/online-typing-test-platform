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
  small: "text-xl h-[6.8rem]",
  medium: "text-2xl h-[7.8rem]",
  large: "text-3xl h-[9.6rem]",
  xlarge: "text-4xl h-[11.8rem]",
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

  // Re-focus the hidden input on any keypress when blurred
  useEffect(() => {
    const handleGlobalKeyDown = () => {
      if (!isFocused && inputRef.current) {
        inputRef.current.focus();
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isFocused, inputRef]);

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

  let wordsOpacity = 0.15;
  if (resetting) {
    wordsOpacity = 0;
  } else if (isFocused) {
    wordsOpacity = 1;
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
              className="flex flex-wrap gap-x-2.5 gap-y-1"
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
              className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 rounded-full bg-foreground/[0.06] px-4 py-2 text-muted-foreground text-sm backdrop-blur-sm">
                <Cursor size={14} weight="duotone" />
                click to focus
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
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-muted-foreground/40 text-xs transition-colors hover:text-muted-foreground"
          onClick={onRestart}
          type="button"
        >
          <ArrowCounterClockwise size={13} weight="duotone" />
          restart
        </button>
        <span className="text-muted-foreground/25 text-xs">
          tab + enter to reset
        </span>
      </motion.div>
    </div>
  );
}
