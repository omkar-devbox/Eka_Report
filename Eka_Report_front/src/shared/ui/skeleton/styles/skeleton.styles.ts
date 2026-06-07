import { cva } from "class-variance-authority";

/**
 * Visual variants for the Skeleton component using class-variance-authority.
 * Centralizes the styling logic and ensures consistency across shapes.
 */
export const skeletonVariants = cva(
  [
    "relative overflow-hidden transition-all duration-300",
    "bg-neutral-200 dark:bg-neutral-800",
    // Premium Shimmer Effect
    "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer",
    "after:bg-gradient-to-r after:from-transparent",
    "after:via-[var(--shimmer-highlight,rgba(255,255,255,0.2))] dark:after:via-[var(--shimmer-highlight,rgba(255,255,255,0.05))]",
    "after:to-transparent",
  ].join(" "),
  {
    variants: {
      variant: {
        rect: "rounded-md",
        circle: "rounded-full",
        text: "rounded h-4 mb-2 last:mb-0",
        square: "aspect-square rounded-md",
      },
    },
    defaultVariants: {
      variant: "rect",
    },
  }
);
