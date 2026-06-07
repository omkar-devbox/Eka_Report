import React from "react";
import { cn } from "../../utils";
import { formFieldBaseStyles as s } from "../../styles/style";
import type { RadioFieldProps } from "../../types/types";

export const RadioField: React.FC<RadioFieldProps> = ({
  id,
  name,
  options,
  labelKey = "label",
  valueKey = "value",
  value,
  defaultChecked,
  disabled,
  required,
  error,
  className,
  onChange,
  styleConfig,
}) => {
  return (
    <div className={cn(s.radioGroup, className)}>
      {options.map((opt, idx) => {
        const optLabel =
          typeof opt === "object" && opt !== null
            ? (opt[labelKey as keyof typeof opt] as React.ReactNode)
            : String(opt);
        const optValue =
          typeof opt === "object" && opt !== null
            ? (opt[valueKey as keyof typeof opt] as string | number)
            : (opt as unknown as string | number);
        const valStr = String(optValue != null ? optValue : idx);
        const optId = `${id}-${idx}`;
        const isChecked = value !== undefined ? value === optValue : defaultChecked;

        return (
          <div key={`${valStr}-${idx}`} className={s.toggleRow}>
            <input
              id={optId}
              type="radio"
              name={name || id}
              value={optValue}
              disabled={disabled}
              required={required && idx === 0}
              className={cn(s.radioInput, error && s.radioInputError)}
              aria-invalid={!!error}
              onChange={onChange}
              {...(onChange
                ? { checked: isChecked }
                : { defaultChecked: isChecked })}
            />
            <label
              htmlFor={optId}
              className={cn(s.inlineLabel, disabled && s.inlineLabelDisabled)}
              style={styleConfig?.label ? { color: styleConfig.label } : undefined}
            >
              {optLabel}
            </label>
          </div>
        );
      })}
    </div>
  );
};
