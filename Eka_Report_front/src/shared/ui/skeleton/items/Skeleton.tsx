import React from "react";
import { cn } from "@/shared/lib/utils";
import { skeletonVariants } from "../styles/skeleton.styles";
import type { SkeletonProps } from "../types/skeleton.types";

/**
 * A highly reusable Skeleton loader component with shimmer animation and StyleConfig support.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rect",
  width,
  height,
  borderRadius,
  count = 1,
  style,
  styleConfig,
}) => {
  const isCircle = variant === "circle";
  const isSquare = variant === "square";
  const isText = variant === "text";

  const customStyle: React.CSSProperties = {
    width: width ?? (isText ? "100%" : undefined),
    height: height ?? (isText ? "1em" : isSquare || isCircle ? width : undefined),
    borderRadius: styleConfig?.borderRadius ?? borderRadius ?? undefined,
    backgroundColor: styleConfig?.baseColor,
    // Inject CSS variables for the shimmer overlay
    ["--shimmer-highlight" as any]: styleConfig?.highlightColor,
    ["--shimmer-duration" as any]: styleConfig?.duration ? `${styleConfig.duration}s` : undefined,
    ...style,
  };

  const skeletonElements = Array.from({ length: count }).map((_, index) => (
    <div
      key={index}
      className={cn(skeletonVariants({ variant, className }))}
      style={customStyle}
    />
  ));

  return count > 1 ? (
    <div className="flex flex-col gap-2 w-full">{skeletonElements}</div>
  ) : (
    skeletonElements[0]
  );
};

/**
 * Example of a complex loading state using the Skeleton component.
 */
export const ContentSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circle" width={48} height={48} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton variant="rect" height={200} className="w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton variant="square" />
          <Skeleton variant="square" />
          <Skeleton variant="square" />
        </div>
        <Skeleton count={3} variant="text" />
      </div>
    </div>
  );
};

