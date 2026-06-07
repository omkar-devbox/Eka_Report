import { cn } from "@/shared/lib/utils";
import type { ToastContainerProps } from "../types/toast.types";
import { useToast } from "../hooks/useToast";
import { ToastItem } from "./ToastItem";
import { POSITION_MAP } from "../styles/toast.styles";

export function ToastContainer({ className }: ToastContainerProps) {
  const { toasts, position, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-3 pointer-events-none",
        POSITION_MAP[position],
        className,
      )}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} item={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
