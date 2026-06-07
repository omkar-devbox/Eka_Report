import { useState, useCallback, useMemo } from "react";
import type { ToastItemProps } from "../types/toast.types";
import { BaseNotification } from "./BaseNotification";
import { DEFAULT_TOAST_DURATION } from "../types/toast.types";
import { useTimer } from "../hooks/useTimer";
import { cn } from "@/shared/lib/utils";
import { NOTIFICATION_UI } from "../styles/toast.styles";

export function ToastItem({ item, onClose }: ToastItemProps) {
  const [exiting, setExiting] = useState(false);
  const duration = useMemo(
    () => item.duration || DEFAULT_TOAST_DURATION,
    [item.duration],
  );

  const handleClose = useCallback(() => {
    setExiting(true);
    setTimeout(() => onClose(item.id), 250);
  }, [item.id, onClose]);

  const { isPaused, pause, resume } = useTimer({
    duration,
    onExpire: handleClose,
    isPaused: item.variant === "loading",
  });

  const onMouseEnter = useCallback(() => {
    if (item.variant !== "loading") pause();
  }, [item.variant, pause]);

  const onMouseLeave = useCallback(() => {
    if (item.variant !== "loading") resume();
  }, [item.variant, resume]);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(NOTIFICATION_UI.container, "pointer-events-auto")}
    >
      <BaseNotification
        variant={item.variant}
        title={item.title}
        description={item.description}
        content={item.content}
        onClose={handleClose}
        showProgress={true}
        duration={duration}
        isPaused={isPaused}
        theme={item.theme}
        icon={item.icon}
        exiting={exiting}
      />
    </div>
  );
}
