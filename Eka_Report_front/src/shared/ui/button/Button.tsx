import { forwardRef, memo } from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./styles/button.styles";
import { type ButtonProps, type ButtonStyleConfig } from "./types/button.types";

const getStyleVars = (config?: ButtonStyleConfig) =>
  config
    ? Object.entries(config).reduce(
        (acc, [k, v]) => (v ? { ...acc, [`--btn-${k}`]: v } : acc),
        {},
      )
    : {};

export const Button = memo(
  forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        className,
        variant,
        size,
        fullWidth,
        asChild = false,
        isLoading = false,
        leftIcon,
        rightIcon,
        children,
        disabled,
        styleConfig,
        style,
        type = "button",
        ...props
      },
      ref,
    ) => {
      const Comp = asChild ? Slot : "button";
      const isDisabled = disabled || isLoading;

      return (
        <Comp
          ref={ref}
          type={type}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          data-loading={isLoading}
          className={cn(buttonVariants({ variant, size, fullWidth }), className)}
          style={{ ...getStyleVars(styleConfig), ...style } as React.CSSProperties}
          {...props}
        >
          {leftIcon}
          {children}
          {rightIcon}

          {isLoading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="loader animate-spin shrink-0" />
            </span>
          )}
        </Comp>
      );
    },
  ),
);

Button.displayName = "Button";
