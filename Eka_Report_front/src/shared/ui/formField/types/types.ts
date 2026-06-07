import React from "react";
import type { DatePickerView } from "../items/DatePicker/types/CustomDatePicker.types";

/* ── Style Config ─────────────────────────────────────────── */

export type FormFieldStyleConfig = {
  bg?: string;
  text?: string;
  border?: string;
  label?: string;

  hoverBg?: string;
  hoverText?: string;

  activeBorder?: string;
  errorActiveBg?: string;

  disabledBg?: string;
  disabledText?: string;

  errorBg?: string;
  errorText?: string;
  errorBorder?: string;
};

type FieldOnChange<V = unknown> = (
  value:
    | V
    | React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
  meta?: unknown,
) => void;

interface LoadOptionsPage<T = unknown> {
  options: FormOption<T>[];
  hasMore: boolean;
}

type LoadOptionsResult<T = unknown> = FormOption<T>[] | LoadOptionsPage<T>;

/* ── Option Type ─────────────────────────────────────────── */

export interface FormOption<T = unknown> {
  label: string | React.ReactNode;
  value: T;
  disabled?: boolean;
  [key: string]: unknown;
}

/* ── Base Props ─────────────────────────────────────────── */

interface BaseFormFieldProps<T, V = unknown> {
  type: T | boolean;

  label?: string | React.ReactNode;
  hint?: string | React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  isPII?: boolean;

  fullWidth?: boolean;
  fieldSize?: "sm" | "md" | "lg";

  wrapperClassName?: string;

  name?: string;
  required?: boolean;
  disabled?: boolean;

  styleConfig?: FormFieldStyleConfig;

  value?: V;
  defaultValue?: V;

  onChange?: FieldOnChange<V>;
}

/* ── Text Field ─────────────────────────────────────────── */

export interface TextFieldProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "type" | "size" | "value" | "defaultValue" | "onChange" | "autoComplete"
    >,
    BaseFormFieldProps<
      "text" | "email" | "password" | "number" | "tel" | "url",
      string | number
    > {}

/* ── Text Area ─────────────────────────────────────────── */

export interface TextAreaProps
  extends
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "value" | "defaultValue" | "onChange" | "autoComplete"
    >,
    BaseFormFieldProps<"textarea", string> {
  rows?: number;
}

/* ── Select ───────────────────────────────────────────── */

export interface SelectFieldProps<T = unknown>
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue">,
    BaseFormFieldProps<"select", T | T[]> {
  options?: FormOption<T>[];

  labelKey?: string;
  valueKey?: string;

  placeholder?: string;

  isMulti?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;

  loadingMessage?: string;
  noOptionsMessage?: string;

  loadOptions?: (
    inputValue: string,
    page?: number,
  ) => Promise<LoadOptionsResult<T>>;

  defaultOptions?: boolean;
  cacheOptions?: boolean;
  allowCreate?: boolean;
}

/* ── Checkbox ─────────────────────────────────────────── */

export interface CheckboxFieldProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "type" | "size" | "value" | "defaultValue" | "onChange"
    >,
    BaseFormFieldProps<"checkbox", boolean> {}

/* ── Radio ───────────────────────────────────────────── */

export interface RadioFieldProps<T = unknown>
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "type" | "size" | "value" | "defaultValue" | "onChange"
    >,
    BaseFormFieldProps<"radio", T> {
  options: FormOption<T>[];
  labelKey?: string;
  valueKey?: string;
}

/* ── Date ───────────────────────────────────────────── */

export interface DateFieldProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      "type" | "size" | "value" | "defaultValue" | "onChange"
    >,
    BaseFormFieldProps<"date", string | Date | null> {
  minDate?: string | Date;
  maxDate?: string | Date;

  showTodayButton?: boolean;

  dateFormat?:
    | "dd-mm-yyyy"
    | "mm-dd-yyyy"
    | "yyyy-mm-dd"
    | "yyyy-dd-mm"
    | "dd-MMM-yyyy"
    | "mm-yyyy"
    | "yyyy";

  showTime?: boolean;
  initialView?: DatePickerView;
  minView?: DatePickerView;
}

/* ── Final Union ───────────────────────────────────────── */

export type FormFieldProps =
  | TextFieldProps
  | TextAreaProps
  | SelectFieldProps
  | CheckboxFieldProps
  | RadioFieldProps
  | DateFieldProps;

/* ── Utility ─────────────────────────────────────────── */

export type CustomSelectProps<T = unknown> = Omit<SelectFieldProps<T>, "type">;

/* ── External ─────────────────────────────────────────── */

export type * from "../items/DatePicker/types/CustomDatePicker.types";
