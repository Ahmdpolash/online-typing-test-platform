"use client";

import { motion } from "motion/react";
import type { QuoteLength } from "@/lib/quotes";
import type { TestMode, TimeOption, WordOption } from "@/lib/test-storage";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/words";
import { DesktopToolbar } from "./desktop-toolbar";
import { MobileToolbar } from "./mobile-toolbar";

export interface TestControlsProps {
  controlsVisible: boolean;
  difficulty: Difficulty | undefined;
  mode: TestMode;
  numbers: boolean;
  onDifficultyToggle: (d: Difficulty) => void;
  onModeChange: (next: TestMode) => void;
  onNumbersToggle: () => void;
  onPunctuationToggle: () => void;
  onQuoteLengthChange: (next: QuoteLength) => void;
  onRestart: () => void;
  onTimeOptionChange: (next: TimeOption) => void;
  onWordOptionChange: (next: WordOption) => void;
  punctuation: boolean;
  quoteLength: QuoteLength;
  timeOption: TimeOption;
  wordOption: WordOption;
}

export function TestControls(props: TestControlsProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="hidden md:block">
        <DesktopToolbar {...props} />
      </div>
      <div className="block md:hidden">
        <MobileToolbar {...props} />
      </div>
    </div>
  );
}
