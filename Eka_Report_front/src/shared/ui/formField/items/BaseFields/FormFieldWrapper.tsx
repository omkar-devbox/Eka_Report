import React from "react";
import { cn } from "../../utils";
import { formFieldBaseStyles as s } from "../../styles/style";
import type { FormFieldStyleConfig } from "../../types/types";
import { Tooltip } from "../../../tooltip";

const getStyleVars = (config?: FormFieldStyleConfig) =>
  config
    ? Object.entries(config).reduce(
        (acc, [k, v]) => (v ? { ...acc, [`--ff-${k}`]: v } : acc),
        {}
      )
    : {};

interface FormFieldWrapperProps {
  id: string;
  label?: string | React.ReactNode;
  hint?: string | React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  wrapperClassName?: string;
  children: React.ReactNode;
  hideLabel?: boolean;
  styleConfig?: FormFieldStyleConfig;
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({
  id,
  label,
  hint,
  error,
  helperText,
  required,
  disabled,
  fullWidth = true,
  wrapperClassName,
  children,
  hideLabel = false,
  styleConfig,
}) => {
  return (
    <div
      style={getStyleVars(styleConfig) as React.CSSProperties}
      className={cn(
        s.wrapper,
        fullWidth ? s.wrapperFull : s.wrapperAuto,
        wrapperClassName,
      )}
    >
      {label && !hideLabel && (
        <label
          htmlFor={id}
          className={cn(s.label, disabled && s.labelDisabled)}
          style={styleConfig?.label ? { color: styleConfig.label } : undefined}
        >
          {hint ? (
            <Tooltip content={hint} placement="top-start">
              <span className={s.hint}>
                {label}
              </span>
            </Tooltip>
          ) : (
            label
          )}
          {required && <span className={s.requiredMark}>*</span>}
        </label>
      )}

      {children}

      {(helperText || error) && (
        <p
          className={error ? s.errorText : s.helperText}
          role={error ? "alert" : undefined}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
};
