import { forwardRef } from "react";
import { cn } from "../../utils";
import { formFieldBaseStyles as s } from "../../styles/style";
import type { CheckboxFieldProps } from "../../types/types";
import { Tooltip } from "../../../tooltip";

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  (
    {
      id,
      disabled,
      required,
      className,
      error,
      label,
      hint,
      value,
      type: _type, // eslint-disable-line @typescript-eslint/no-unused-vars
      defaultValue: _defaultValue, // eslint-disable-line @typescript-eslint/no-unused-vars
      isPII: _isPII, // Destructure to avoid spreading to DOM
      onChange,
      styleConfig,
      ...rest
    },
    ref,
  ) => {
    // Omit controlled/uncontrolled props from rest to avoid conflicts
    const { checked: _c, defaultChecked: _dc, ...cleanRest } = rest as any;

    const isControlled = onChange !== undefined;

    return (
      <div className={s.toggleRow}>
        <input
          ref={ref}
          id={id}
          type="checkbox"
          disabled={disabled}
          required={required}
          className={cn(
            s.checkboxInput,
            error && s.checkboxInputError,
            className,
          )}
          aria-invalid={!!error}
          onChange={(e) => onChange?.(e)}
          {...(isControlled
            ? { checked: Boolean(value) }
            : { defaultChecked: Boolean(value) })}
          {...cleanRest}
        />
        {label && (
          <label
            htmlFor={id}
            className={cn(s.inlineLabel, disabled && s.inlineLabelDisabled)}
            style={styleConfig?.label ? { color: styleConfig.label } : undefined}
          >
            {hint ? (
              <Tooltip content={hint} placement="top-start">
                <span className={s.hint}>{label}</span>
              </Tooltip>
            ) : (
              label
            )}
            {required && <span className={s.requiredMark}>*</span>}
          </label>
        )}
      </div>
    );
  },
);

CheckboxField.displayName = "CheckboxField";
