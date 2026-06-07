import React, { Suspense, lazy, type ComponentType } from "react";
import { Loading } from "./Loading";

/* ── Loading Props (aligned with your loader) ─────────────── */

interface LazyProps {
  fullScreen?: boolean;
  text?: string;
  variant?: "spinner" | "skeleton";
}

/* ── HOC: withLazy ───────────────────────────────────────── */

export function withLazy<T extends object>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  loadingProps: LazyProps = {},
) {
  const LazyComponent = lazy(importFn);

  return (props: T) => (
    <Suspense fallback={<Loading {...loadingProps} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/* ── Wrapper Component ───────────────────────────────────── */

export const Lazy: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  fullScreen?: boolean;
  text?: string;
  variant?: "spinner" | "skeleton";
}> = ({ children, fallback, fullScreen, text, variant }) => {
  return (
    <Suspense
      fallback={
        fallback || (
          <Loading fullScreen={fullScreen} text={text} variant={variant} />
        )
      }
    >
      {children}
    </Suspense>
  );
};
