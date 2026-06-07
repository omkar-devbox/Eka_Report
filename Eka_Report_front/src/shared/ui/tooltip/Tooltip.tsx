import { useState, useMemo } from "react";
import {
  useFloating,
  autoUpdate,
  offset as offsetMiddleware,
  flip,
  shift,
  arrow,
  useInteractions,
  useHover,
  useFocus,
  useRole,
  useDismiss,
  FloatingPortal,
  FloatingArrow,
} from "@floating-ui/react";
import { cn } from "@/shared/lib/utils";
import { tooltipBaseStyles, tooltipVariants } from "./styles/tooltip.styles";
import type { TooltipProps } from "./types/tooltip.types";

const DEFAULT_DELAY = { open: 200, close: 0 };

/**
 * Tooltip Component
 * Enterprise-grade, AI-ready tooltip with flexible portal and style systems.
 */
export function Tooltip({
  children,
  content,
  placement = "top",
  offset = 8,
  className,
  variant = "dark",
  color,
  textColor,
  styleConfig,
  showArrow = true,
  delay = DEFAULT_DELAY,
  portal = true,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [arrowEl, setArrowEl] = useState<SVGSVGElement | null>(null);

  // 1. Floating UI configuration
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offsetMiddleware(offset),
      flip(),
      shift({ padding: 5 }),
      ...(showArrow ? [arrow({ element: arrowEl })] : []),
    ],
  });

  // 2. Interaction hooks
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      delay: typeof delay === "number" ? { open: delay, close: 0 } : delay,
    }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: "tooltip" }),
  ]);

  // 3. Style Resolution (Priority: variant < styleConfig < direct props)
  const resolvedStyles = useMemo(() => {
    return {
      "--tt-bg": color || styleConfig?.bg,
      "--tt-text": textColor || styleConfig?.text,
      "--tt-border": styleConfig?.border,
    } as React.CSSProperties;
  }, [color, textColor, styleConfig]);

  if (!content) return <>{children}</>;

  // 4. Tooltip Content Component
  const tooltipContent = (
      <div 
        ref={(node) => refs.setFloating(node)}
        style={{ ...floatingStyles, ...resolvedStyles }}
        {...getFloatingProps()}
        className={cn(
          tooltipBaseStyles.panel,
          tooltipVariants[variant].panel,
          className,
        )}
        data-variant={variant}
      >
        {content}

      {showArrow && (
        <FloatingArrow
          ref={setArrowEl}
          context={context}
          className={tooltipVariants[variant].arrow}
          fill="var(--tt-bg, currentColor)"
          style={{
            // If custom BG is provided, use it for arrow fill, otherwise fallback to class
            fill: (color || styleConfig?.bg) ? "var(--tt-bg)" : undefined,
          }}
        />
      )}
    </div>
  );

  // 5. Portal Resolution
  const renderContainer = () => {
    if (portal === false) return tooltipContent;
    
    return (
      <FloatingPortal root={portal instanceof HTMLElement ? portal : undefined}>
        {tooltipContent}
      </FloatingPortal>
    );
  };

  return (
    <>
      <div 
        ref={(node) => refs.setReference(node)} 
        className={tooltipBaseStyles.triggerWrapper}
        {...getReferenceProps()}
      >
        {children}
      </div>
      {open && renderContainer()}
    </>
  );
}
