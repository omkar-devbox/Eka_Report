import React from "react";
import { m, AnimatePresence } from "framer-motion";

import { cn } from "@/shared/lib/utils";
import { ContentSkeleton } from "../../skeleton";
import { loadingBaseStyles } from "../style/style";

/* ── Props ─────────────────────────────────────────────────── */

interface LoadingProps {
  fullScreen?: boolean;
  text?: string;
  className?: string;
  variant?: "spinner" | "skeleton";
  progress?: number; // optional
}

/* ── Component ─────────────────────────────────────────────── */

export const Loading: React.FC<LoadingProps> = ({
  fullScreen = true,
  text = "LOADING",
  className,
  variant = "spinner",
  progress,
}) => {
  const base = loadingBaseStyles;

  /* ── Skeleton Mode ───────────────────────────────────────── */
  if (variant === "skeleton") {
    return (
      <div className={cn(base.skeletonWrapper, className)}>
        <ContentSkeleton />
      </div>
    );
  }

  /* ── Main Loader ─────────────────────────────────────────── */
  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          base.wrapper,
          fullScreen ? base.fullScreen : base.inline,
          className,
        )}
      >
        <div className={base.card}>
          {/* Logo */}
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={base.logo}
          >
            RT
          </m.div>

          {/* Loader */}
          <div className={base.loader}>
            <m.div
              className={base.loaderBar}
              animate={
                progress !== undefined
                  ? { width: `${progress}%` }
                  : { x: ["-100%", "250%"] }
              }
              transition={
                progress !== undefined
                  ? { duration: 0.4 }
                  : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
              }
            />
          </div>

          {/* Text */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={base.text}
          >
            {text}
          </m.div>
        </div>
      </m.div>
    </AnimatePresence>
  );
};
