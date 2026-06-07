import type { ButtonHTMLAttributes, ReactNode } from "react";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "../styles/button.styles";

export interface ButtonStyleConfig {
  bg?: string;
  text?: string;
  border?: string;
  hoverBg?: string;
  hoverText?: string;
  activeBg?: string;
  disabledBg?: string;
  disabledText?: string;
}

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  styleConfig?: ButtonStyleConfig;
}
