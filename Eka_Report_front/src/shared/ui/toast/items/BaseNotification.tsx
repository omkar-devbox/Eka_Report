import { X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { ToastVariant, BaseNotificationProps } from "../types/toast.types";
import {
  notificationVariants,
  NOTIFICATION_CONFIG,
  NOTIFICATION_UI,
} from "../styles/toast.styles";
import {
  useThemeVariables,
  THEME_VAR_CLASSES,
} from "../hooks/useThemeVariables";

interface LocalBaseNotificationProps extends BaseNotificationProps {
  variant?: ToastVariant;
  onClose?: () => void;
  showProgress?: boolean;
  isPaused?: boolean;
  exiting?: boolean;
  className?: string;
}

export function BaseNotification({
  variant = "info",
  title,
  description,
  content,
  icon,
  onClose,
  showProgress = false,
  duration = 4000,
  isPaused = false,
  theme,
  exiting = false,
  className,
}: LocalBaseNotificationProps) {
  const config = NOTIFICATION_CONFIG[variant];
  const Icon = config.icon;
  const styleVariables = useThemeVariables(theme);

  // Content priority: content > description
  const body = content ?? description;

  return (
    <div
      className={cn(
        notificationVariants({ variant, exiting }),
        theme && THEME_VAR_CLASSES.container,
        className,
      )}
      style={styleVariables}
    >
      {/* Icon */}
      <div
        className={cn(
          NOTIFICATION_UI.iconContainer,
          config.colorClass,
          theme?.iconBg && "bg-[var(--toast-icon-bg)]",
          theme?.iconText && "text-[var(--toast-icon-text)]",
        )}
      >
        {icon || (
          <Icon className={cn("size-3 stroke-[2.5px]", config.animate)} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {title && (
              <div className="font-semibold text-[14px] leading-tight">
                {title}
              </div>
            )}
            {body && (
              <div
                className={cn(
                  "text-[13px] leading-relaxed text-foreground/90",
                  title && "mt-0.5",
                )}
              >
                {body}
              </div>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={NOTIFICATION_UI.closeButton}
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && variant !== "loading" && (
        <div className={NOTIFICATION_UI.progressBarContainer}>
          <div
            className={cn(
              NOTIFICATION_UI.progressBar,
              config.colorClass,
              theme?.progress && THEME_VAR_CLASSES.progress,
            )}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
              animationPlayState: isPaused ? "paused" : "running",
              transformOrigin: "left",
            }}
          />
        </div>
      )}
    </div>
  );
}
