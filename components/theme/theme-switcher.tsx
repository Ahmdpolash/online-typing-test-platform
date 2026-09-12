"use client";

import { Moon, Sun, Monitor } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type ThemeValue = "light" | "dark" | "system";

interface ThemeSwitcherProps {
  className?: string;
  onChange: (next: ThemeValue) => void;
  value: ThemeValue;
}

const OPTIONS: { value: ThemeValue; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

export function ThemeSwitcher({ value, onChange, className }: ThemeSwitcherProps) {
  return (
    <div
      className={cn(
        "flex items-center rounded-full bg-foreground/[0.05] p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ value: v, icon: Icon, label }) => (
        <button
          aria-label={label}
          className={cn(
            "flex items-center justify-center rounded-full p-1.5 transition-colors duration-150",
            value === v
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground/50 hover:text-muted-foreground"
          )}
          key={v}
          onClick={() => onChange(v)}
          type="button"
        >
          <Icon size={13} weight="duotone" />
        </button>
      ))}
    </div>
  );
}
