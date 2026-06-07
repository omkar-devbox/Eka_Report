import type { AlertProps } from "../types/toast.types";
import { BaseNotification } from "./BaseNotification";

export function Alert({
  variant = "info",
  onClose,
  title,
  description,
  content,
  theme,
  icon,
}: AlertProps) {
  return (
    <BaseNotification
      variant={variant}
      title={title}
      description={description}
      content={content}
      onClose={onClose}
      theme={theme}
      icon={icon}
      className="shadow-sm w-full"
    />
  );
}
