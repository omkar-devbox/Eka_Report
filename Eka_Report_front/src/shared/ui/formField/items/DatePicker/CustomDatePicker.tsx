import {
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { FloatingPortal } from "@floating-ui/react";
import { cn } from "../../utils";
import type { CustomDatePickerProps } from "./types/CustomDatePicker.types";
import { useDatePicker } from "./hooks/useDatePicker";
import { DatePickerInput } from "./items/DatePickerInput";
import { DatePickerPopover } from "./items/DatePickerPopover";

const CustomDatePicker = forwardRef<HTMLInputElement, CustomDatePickerProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      disabled,
      placeholder = "Select date...",
      name,
      className,
      id,
      isClearable = false,
      minDate,
      maxDate,
      showTodayButton = true,
      dateFormat = "dd-mm-yyyy",
      showTime = false,
      initialView,
      minView,
      ...rest
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const {
      inputProps,
      popoverProps,
      isOpen,
      refs,
      floatingStyles,
    } = useDatePicker({
      value,
      onChange,
      name,
      minDate,
      maxDate,
      dateFormat,
      showTime,
      initialView,
      minView,
    });


    return (
      <div 
        className={cn("relative w-full", className)}
      >
        <DatePickerInput
          id={id}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={rest["aria-invalid"]}
          isClearable={isClearable}
          hasValue={!!value}
          dateFormat={dateFormat}
          showTime={showTime}
          localInputRef={inputRef}
          setReference={refs.setReference}
          {...inputProps}
        />

        {isOpen && !disabled && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-[9999]"
            >
              <DatePickerPopover
                {...popoverProps}
                showTodayButton={showTodayButton}
                showTime={showTime}
              />
            </div>
          </FloatingPortal>
        )}
      </div>
    );
  },
);

CustomDatePicker.displayName = "CustomDatePicker";

export { CustomDatePicker };
