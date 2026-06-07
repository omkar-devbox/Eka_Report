import React from "react";
import { cn } from "../../../utils";
import type { DatePickerView } from "../types/CustomDatePicker.types";
import { CalendarHeader } from "./CalendarHeader";
import { DayGridView } from "./DayGridView";
import { MonthGridView } from "./MonthGridView";
import { YearGridView } from "./YearGridView";
import { TimePicker } from "./TimePicker";
import { datePickerStyles as s } from "../styles/style";

interface DatePickerPopoverProps {
  view: DatePickerView;
  setView: (view: DatePickerView) => void;
  viewDate: Date;
  selectedDate: Date | null;
  todayDate: Date;
  decadeStart: number;

  focusedDay: number | null;
  setFocusedDay: (day: number | null) => void;
  focusedMonth: number | null;
  setFocusedMonth: (month: number | null) => void;
  focusedYear: number | null;
  setFocusedYear: (year: number | null) => void;

  isDateDisabled: (d: Date) => boolean;
  isMonthDisabled: (year: number, month: number) => boolean;
  isYearDisabled: (year: number) => boolean;

  handlePrev: (e: React.MouseEvent | React.KeyboardEvent) => void;
  handleNext: (e: React.MouseEvent | React.KeyboardEvent) => void;
  selectDay: (d: number, e?: React.MouseEvent) => void;
  selectMonth: (m: number, e?: React.MouseEvent) => void;
  selectYear: (y: number, e?: React.MouseEvent) => void;
  handleToday: (e: React.MouseEvent) => void;

  handleGridKeyDown: (e: React.KeyboardEvent) => void;
  triggerChange: (d: Date | null) => void;
  handleApply: () => void;

  showTodayButton: boolean;
  showTime: boolean;
  getFloatingProps?: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
}

export const DatePickerPopover = React.memo(
  ({
    view,
    setView,
    viewDate,
    selectedDate,
    todayDate,
    decadeStart,
    focusedDay,
    setFocusedDay,
    focusedMonth,
    setFocusedMonth,
    focusedYear,
    setFocusedYear,
    isDateDisabled,
    isMonthDisabled,
    isYearDisabled,
    handlePrev,
    handleNext,
    selectDay,
    selectMonth,
    selectYear,
    handleToday,
    handleGridKeyDown,
    triggerChange,
    handleApply,
    showTodayButton,
    showTime,
    getFloatingProps,
  }: DatePickerPopoverProps) => {
    return (
      <div
        className={s.popover}
        onKeyDown={handleGridKeyDown}
        onMouseDown={(e) => e.preventDefault()}
        {...(getFloatingProps?.() || {})}
      >
        <CalendarHeader
          view={view}
          viewDate={viewDate}
          decadeStart={decadeStart}
          onPrev={handlePrev}
          onNext={handleNext}
          onViewChange={setView}
        />

        <div className="p-3">
          {view === "day" && (
            <DayGridView
              viewDate={viewDate}
              selectedDate={selectedDate}
              today={todayDate}
              focusedDay={focusedDay}
              onSelectDay={selectDay}
              onFocusDay={setFocusedDay}
              isDateDisabled={isDateDisabled}
            />
          )}

          {view === "month" && (
            <MonthGridView
              viewDate={viewDate}
              selectedDate={selectedDate}
              today={todayDate}
              focusedMonth={focusedMonth}
              onSelectMonth={selectMonth}
              onFocusMonth={setFocusedMonth}
              isMonthDisabled={isMonthDisabled}
            />
          )}

          {view === "year" && (
            <YearGridView
              viewDate={viewDate}
              decadeStart={decadeStart}
              today={todayDate}
              focusedYear={focusedYear}
              onSelectYear={selectYear}
              onFocusYear={setFocusedYear}
              isYearDisabled={isYearDisabled}
            />
          )}
        </div>

        {/* Footer */}
        {(showTodayButton || selectedDate || showTime) && (
          <div className={s.footer}>
            {showTime && (
              <TimePicker
                selectedDate={selectedDate}
                onChange={triggerChange}
              />
            )}

            <div className="flex items-center justify-between mt-1">
              {showTodayButton && (
                <button
                  type="button"
                  onClick={handleToday}
                  className={cn(
                    s.shortcutBtn,
                    isDateDisabled(todayDate) &&
                      "opacity-40 cursor-not-allowed",
                  )}
                >
                  {showTime ? "Now" : "Today"}
                </button>
              )}
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                {selectedDate && !showTime && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerChange(null);
                    }}
                    className={s.clearBtn}
                  >
                    Clear
                  </button>
                )}

                {showTime && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply();
                    }}
                    className={s.applyBtn}
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
