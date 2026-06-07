import React, { useMemo } from "react";
import { MONTH_NAMES_LONG } from "../../../utils";
import { ChevronLeftIcon, ChevronRightIcon } from "../../../icons";
import type { DatePickerHeaderProps } from "../types/CustomDatePicker.types";
import { datePickerStyles as s } from "../styles/style";

export const CalendarHeader = React.memo(
  ({
    view,
    viewDate,
    decadeStart,
    onPrev,
    onNext,
    onViewChange,
  }: DatePickerHeaderProps) => {
    const label = useMemo(() => {
      if (view === "day") {
        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewChange("month");
              }}
              className={s.headerLabelBtn}
            >
              {MONTH_NAMES_LONG[viewDate.getMonth()]}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewChange("year");
              }}
              className={s.headerLabelBtn}
            >
              {viewDate.getFullYear()}
            </button>
          </div>
        );
      }
      if (view === "month") {
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewChange("year");
            }}
            className={s.headerLabelBtn}
          >
            {viewDate.getFullYear()}
          </button>
        );
      }
      return (
        <span className="font-semibold">
          {decadeStart} – {decadeStart + 11}
        </span>
      );
    }, [view, viewDate, decadeStart, onViewChange]);

    return (
      <div className={s.header}>
        <button
          type="button"
          onClick={onPrev}
          className={s.headerBtn}
          aria-label="Previous"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        <div className="flex items-center text-sm text-text select-none">
          {label}
        </div>

        <button
          type="button"
          onClick={onNext}
          className={s.headerBtn}
          aria-label="Next"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    );
  },
);
