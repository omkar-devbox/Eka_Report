import React from "react";

/**
 * Custom styling configuration for the Skeleton component.
 * Allows overriding colors and visual properties.
 */
export interface SkeletonStyleConfig {
  /** Base background color of the skeleton. */
  baseColor?: string;
  /** Color of the shimmer/highlight effect. */
  highlightColor?: string;
  /** Custom border radius for the skeleton. */
  borderRadius?: string | number;
  /** Custom animation duration in seconds. */
  duration?: number;
}

/**
 * Props for the Skeleton component.
 */
export interface SkeletonProps {
  /** Optional CSS class name for custom styling. */
  className?: string;
  /**
   * The visual variant of the skeleton.
   * - 'rect': Rectangular shape with slight rounding.
   * - 'circle': Fully circular shape.
   * - 'text': Standard text line height.
   * - 'square': Equal width and height.
   */
  variant?: "rect" | "circle" | "text" | "square";
  /** Explicit width (e.g., '100%', '50px', or number for pixels). */
  width?: string | number;
  /** Explicit height (e.g., '20px', '100%', or number for pixels). */
  height?: string | number;
  /** Custom border radius (shortcut for styleConfig.borderRadius). */
  borderRadius?: string | number;
  /** Number of skeletons to render (useful for lists). */
  count?: number;
  /** Additional inline styles. */
  style?: React.CSSProperties;
  /** Custom styling configuration. */
  styleConfig?: SkeletonStyleConfig;
}
