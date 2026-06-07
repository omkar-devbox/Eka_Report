import type { ReactNode } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info" | "loading";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "bottom-center"
  | "top-center";

export const DEFAULT_TOAST_DURATION = 4000;

interface BaseStyle {
  bg?: string;
  text?: string;
  border?: string;
}

export interface ToastTheme extends BaseStyle {
  iconBg?: string;
  iconText?: string;
  progress?: string;
}

export interface BaseNotificationProps {
  title?: string;
  description?: string;
  content?: ReactNode;
  duration?: number;
  theme?: ToastTheme;
  icon?: ReactNode;
}

export type ToastOptions = BaseNotificationProps;

export type ToastInput = ReactNode | ToastOptions;

export interface ToastItem extends BaseNotificationProps {
  id: string;
  variant: ToastVariant;
}

export interface ToastItemProps {
  item: ToastItem;
  onClose: (id: string) => void;
}

export interface ToastContainerProps {
  position?: ToastPosition;
  className?: string;
}

export interface AlertProps extends BaseNotificationProps {
  variant?: ToastVariant;
  onClose?: () => void;
}
