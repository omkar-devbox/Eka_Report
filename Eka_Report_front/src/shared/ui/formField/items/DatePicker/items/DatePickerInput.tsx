import React from "react";
import { cn } from "../../../utils";
import { XIcon, CalendarIcon } from "../../../icons";
import { datePickerStyles as s } from "../styles/style";

interface DatePickerInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];

  inputValue: string;
  setInputValue: (val: string) => void;
  isOpen: boolean;
  isClearable: boolean;
  hasValue: boolean; // to determine if clear icon shows
  dateFormat: string;
  showTime: boolean;

  localInputRef: React.RefObject<HTMLInputElement | null>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputBlur: () => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  handleClear: (e: React.MouseEvent) => void;
  getReferenceProps?: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
  setReference?: (node: HTMLElement | null) => void;
}

export const DatePickerInput = React.memo(
  ({
    id,
    name,
    placeholder,
    disabled,
    "aria-invalid": ariaInvalid,

    inputValue,
    isOpen,
    isClearable,
    hasValue,
    localInputRef,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
    handlePaste,
    handleClear,
    getReferenceProps,
    setReference,
  }: DatePickerInputProps) => {
    return (
      <div
        className={cn(
          s.inputWrapper,
          disabled && s.inputDisabled,
          ariaInvalid && s.inputError,
        )}
        ref={setReference}
        {...(getReferenceProps?.() || {})}
      >
        <CalendarIcon
          className={cn(
            "h-5 w-5 text-text-muted transition-colors mr-3 shrink-0",
            isOpen && "text-[color:var(--ff-activeBorder,var(--primary))]",
            !disabled && "cursor-pointer hover:text-[color:var(--ff-activeBorder,var(--primary))]",
          )}
        />
        
        <input
          ref={localInputRef}
          id={id}
          name={name}
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onPaste={handlePaste}
          onBlur={handleInputBlur}
          autoComplete="off"
          className="flex-1 bg-transparent border-none outline-none p-0 text-[15px] text-input-text placeholder:text-text-muted"
        />

        {isClearable && hasValue && !disabled && (
          <div className="flex items-center ml-2 pl-2 border-l border-border">
            <XIcon
              className="h-4 w-4 text-text-muted cursor-pointer hover:text-error transition-colors"
              onClick={handleClear}
            />
          </div>
        )}

        {disabled && (
          <div className="flex items-center ml-2 text-text-muted/60 pointer-events-none">
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
        )}
      </div>
    );
  },
);
