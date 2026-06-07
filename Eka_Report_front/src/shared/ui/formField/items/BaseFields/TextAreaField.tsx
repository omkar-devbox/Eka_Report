import { forwardRef } from "react";
import { cn } from "../../utils";
import { formFieldBaseStyles as s } from "../../styles/style";
import type { TextAreaProps } from "../../types/types";

type TextAreaFieldProps = TextAreaProps;

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(
  (
    {
      id,
      disabled,
      required,
      className,
      rows = 3,
      spellCheck,
      error,
      isPII,
      onChange,
      fieldSize,
      ...rest
    },
    ref,
  ) => {
    const textareaElement = (
      <textarea
        ref={ref}
        id={id}
        disabled={disabled}
        required={required}
        className={cn(
          s.input,
          disabled && s.inputDisabled,
          error && s.inputError,
          isPII && s.inputPII,
          className,
        )}
        rows={rows}
        spellCheck={spellCheck ?? (isPII ? false : undefined)}
        aria-invalid={!!error}
        onChange={(e) => onChange?.(e)}
        {...rest}
      />
    );

    if (disabled) {
      return (
        <div className="relative w-full group">
          {textareaElement}
          <div className="absolute right-3 top-3 p-1 text-text-muted/60 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>
      );
    }

    return textareaElement;
  },
);

TextAreaField.displayName = "TextAreaField";
