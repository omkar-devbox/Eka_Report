import type { DateFieldProps } from "../../../types/types";

/** View modes for the advanced date picker */
export type DatePickerView = "day" | "month" | "year";

export interface CustomDatePickerProps extends Omit<DateFieldProps, "type"> {
  /** Whether the field is clearable */
  isClearable?: boolean;
}

export interface DatePickerHeaderProps {
  view: DatePickerView;
  viewDate: Date;
  decadeStart: number;
  onPrev: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onNext: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onViewChange: (view: DatePickerView) => void;
}

export interface DayGridProps {
  viewDate: Date;
  selectedDate: Date | null;
  today: Date;
  focusedDay: number | null;
  minDate?: Date | null;
  maxDate?: Date | null;
  onSelectDay: (day: number, e?: React.MouseEvent) => void;
  onFocusDay: (day: number | null) => void;
  isDateDisabled: (d: Date) => boolean;
}

export interface MonthGridProps {
  viewDate: Date;
  selectedDate: Date | null;
  today: Date;
  focusedMonth: number | null;
  minDate?: Date | null;
  maxDate?: Date | null;
  onSelectMonth: (month: number, e?: React.MouseEvent) => void;
  onFocusMonth: (month: number | null) => void;
  isMonthDisabled: (year: number, month: number) => boolean;
}

export interface YearGridProps {
  viewDate: Date;
  decadeStart: number;
  today: Date;
  focusedYear: number | null;
  minDate?: Date | null;
  maxDate?: Date | null;
  onSelectYear: (year: number, e?: React.MouseEvent) => void;
  onFocusYear: (year: number | null) => void;
  isYearDisabled: (year: number) => boolean;
}

export interface TimePickerProps {
  selectedDate: Date | null;
  onChange: (newDate: Date) => void;
}
