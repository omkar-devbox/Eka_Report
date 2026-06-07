import { forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils";
import { formFieldBaseStyles as s } from "../../styles/style";
import { useNumberInput, usePII } from "../../utils/hooks";
import type { TextFieldProps } from "../../types/types";

type InputFieldProps = TextFieldProps;

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      id,
      type,
      disabled,
      required,
      className,
      spellCheck,
      error,
      isPII = false,
      onKeyDown,
      onChange,
      fieldSize,
      ...rest
    },
    ref,
  ) => {
    const {
      isMasked,
      toggleMask,
      inputType: maskedType,
    } = usePII(isPII, type as string);
    const { handleKeyDown } = useNumberInput(type as string, onKeyDown);

    const inputElement = (
      <input
        ref={ref}
        id={id}
        type={maskedType}
        disabled={disabled}
        required={required}
        className={cn(
          s.input,
          disabled && s.inputDisabled,
          error && s.inputError,
          isPII && s.inputPII,
          className,
        )}
        spellCheck={spellCheck ?? (isPII ? false : undefined)}
        aria-invalid={!!error}
        onKeyDown={handleKeyDown}
        onChange={(e) => onChange?.(e)}
        {...rest}
      />
    );

    if (disabled) {
      return (
        <div className={s.piiWrapper}>
          {inputElement}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted/60 pointer-events-none">
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

    if (isPII) {
      return (
        <div className={s.piiWrapper}>
          {inputElement}
          <button
            type="button"
            onClick={toggleMask}
            disabled={disabled}
            className={cn(
              s.piiToggleButton,
              disabled && s.piiToggleButtonDisabled,
            )}
            aria-label={
              isMasked
                ? "Show sensitive information"
                : "Hide sensitive information"
            }
          >
            {isMasked ? (
              <Eye className={s.piiIcon} />
            ) : (
              <EyeOff className={s.piiIcon} />
            )}
          </button>
        </div>
      );
    }

    return inputElement;
  },
);

InputField.displayName = "InputField";
