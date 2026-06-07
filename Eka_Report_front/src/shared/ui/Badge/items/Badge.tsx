import React from "react";
import { cn } from "@/shared/lib/utils";
import {
  badgeBaseStyles,
  badgeDotColors,
  badgeDotSizes,
  badgeSizeStyles,
  badgeVariantStyles,
} from "../style/style";
import type { BadgeVariant, BadgeSize } from "../style/style";

/* ── Props ─────────────────────────────────────────────────── */

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  dot?: boolean;
  pulse?: boolean;
  count?: number;
  maxCount?: number;
  showZero?: boolean;
  icon?: React.ReactNode;
  theme?: Partial<Record<BadgeVariant, string>>;
}

/* ── Component ─────────────────────────────────────────────── */

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = "default",
      size = "md",
      rounded = false,
      dot = false,
      pulse = false,
      count,
      maxCount = 99,
      showZero = false,
      icon,
      theme = {},
      className,
      ...props
    },
    ref,
  ) => {
    // Count visibility logic
    if (count !== undefined && count === 0 && !showZero) return null;

    const displayCount =
      count !== undefined && count > maxCount ? `${maxCount}+` : count;

    // Merge custom theme overrides with defaults
    const activeVariant = theme?.[variant] ?? badgeVariantStyles[variant];
    const base = badgeBaseStyles;

    return (
      <span
        ref={ref}
        className={cn(
          base.root,
          badgeSizeStyles[size],
          activeVariant,
          rounded ? "rounded-full" : "rounded-md",
          dot && !children && !count && "p-0",
          className,
        )}
        aria-label={count !== undefined ? `${count} notifications` : undefined}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span className={base.dotWrapper}>
            {pulse && (
              <span className={cn(base.dotPing, badgeDotColors[variant])} />
            )}
            <span
              className={cn(
                base.dot,
                badgeDotSizes[size],
                badgeDotColors[variant],
              )}
            />
          </span>
        )}

        {/* Optional icon */}
        {icon && (
          <span
            className={
              children || count !== undefined
                ? base.iconWithSibling
                : base.iconOnly
            }
          >
            {icon}
          </span>
        )}

        {/* Label / count */}
        {count !== undefined ? displayCount : children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
