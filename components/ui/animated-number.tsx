"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

interface AnimatedNumberProps {
  className?: string;
  duration?: number;
  from?: number;
  suffix?: string;
  value: number;
}

export function AnimatedNumber({
  className,
  duration = 1200,
  from = 0,
  suffix,
  value,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    requestAnimationFrame(() => setDisplay(value));
  }, [value]);

  return (
    <NumberFlow
      className={className}
      format={{ useGrouping: true }}
      locales="en-US"
      suffix={suffix}
      transformTiming={{ duration, easing: "ease-out" }}
      value={display}
      willChange
    />
  );
}
