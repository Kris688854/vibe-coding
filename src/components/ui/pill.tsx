import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type PillProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Pill({ children, className, style }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        className,
      )}
      style={style}
    >
      {children}
    </span>
  );
}

