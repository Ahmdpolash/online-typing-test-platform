"use client";

import { At, Hash, TextAa } from "@phosphor-icons/react";
import { LayoutGroup } from "motion/react";
import { useSettings } from "@/components/settings/settings-provider";
import { cn } from "@/lib/utils";
import {
  groupClass,
  MODES,
  Selector,
  Sep,
  SubOptionStack,
  Toggle,
} from "./primitives";
import type { TestControlsProps } from "./test-controls";

export function DesktopToolbar({
  mode,
  timeOption,
  wordOption,
  quoteLength,
  punctuation,
  numbers,
  difficulty,
  onModeChange,
  onTimeOptionChange,
  onWordOptionChange,
  onQuoteLengthChange,
  onPunctuationToggle,
  onNumbersToggle,
  onDifficultyToggle,
}: TestControlsProps) {
  const { fontSize, setFontSize, fontWeight, setFontWeight } = useSettings();

  return (
    <LayoutGroup id="toolbar">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {/* Toggles */}
        <div className={groupClass}>
          <Toggle active={punctuation} onClick={onPunctuationToggle}>
            <At size={15} weight="duotone" />
            punctuation
          </Toggle>
          <Toggle active={numbers} onClick={onNumbersToggle}>
            <Hash size={15} weight="duotone" />
            numbers
          </Toggle>
          <Sep />
          <Toggle
            active={difficulty === "easy"}
            onClick={() => onDifficultyToggle("easy")}
          >
            easy
          </Toggle>
          <Toggle
            active={difficulty === "hard"}
            onClick={() => onDifficultyToggle("hard")}
          >
            hard
          </Toggle>
        </div>

        {/* Mode selector */}
        <div className={groupClass}>
          {MODES.map(({ value, icon: Icon, label }) => (
            <Selector
              active={mode === value}
              key={value}
              layoutId="mode"
              onClick={() => onModeChange(value)}
            >
              <Icon size={15} />
              {label}
            </Selector>
          ))}
        </div>

        {/* Sub-options */}
        <div
          className={cn(
            groupClass,
            "relative grid transition-opacity duration-200 [&>*]:col-start-1 [&>*]:row-start-1",
            mode === "zen" && "pointer-events-none opacity-0"
          )}
        >
          <SubOptionStack
            mode={mode}
            onQuoteLengthChange={onQuoteLengthChange}
            onTimeOptionChange={onTimeOptionChange}
            onWordOptionChange={onWordOptionChange}
            quoteLength={quoteLength}
            timeOption={timeOption}
            wordOption={wordOption}
          />
        </div>

        {/* Font Size & Weight Controls */}
        <div className={groupClass}>
          <span className="flex items-center pl-2 text-muted-foreground/50">
            <TextAa size={14} weight="bold" />
          </span>
          <Selector
            active={fontSize === "small"}
            layoutId="font-size"
            onClick={() => setFontSize("small")}
          >
            18
          </Selector>
          <Selector
            active={fontSize === "medium"}
            layoutId="font-size"
            onClick={() => setFontSize("medium")}
          >
            24
          </Selector>
          <Selector
            active={fontSize === "large"}
            layoutId="font-size"
            onClick={() => setFontSize("large")}
          >
            30
          </Selector>
          <Sep />
          <Toggle
            active={fontWeight === "bold"}
            onClick={() =>
              setFontWeight(fontWeight === "bold" ? "normal" : "bold")
            }
          >
            bold
          </Toggle>
        </div>
      </div>
    </LayoutGroup>
  );
}
