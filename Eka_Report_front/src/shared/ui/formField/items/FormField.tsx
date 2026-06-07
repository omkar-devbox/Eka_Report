import React, { forwardRef, useId } from "react";
import { CustomSelect } from "./CustomSelect/CustomSelect";
import { CustomDatePicker } from "./DatePicker/CustomDatePicker";
import { FormFieldWrapper } from "./BaseFields/FormFieldWrapper";
import { TextAreaField } from "./BaseFields/TextAreaField";
import { CheckboxField } from "./BaseFields/CheckboxField";
import { RadioField } from "./BaseFields/RadioField";
import { InputField } from "./BaseFields/InputField";
import type {
  FormFieldProps,
  TextAreaProps,
  SelectFieldProps,
  DateFieldProps,
  CheckboxFieldProps,
  RadioFieldProps,
  TextFieldProps,
} from "../types/types";

/* ── Component ─────────────────────────────────────────────── */

export const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLDivElement,
  FormFieldProps
>((props, ref) => {
  // Cast to any to allow destructuring of props that might not exist on all union members
  const allProps = props as any;
  const {
    type,
    label,
    hint,
    error,
    helperText,
    fullWidth = true,
    wrapperClassName,
    id: externalId,
    required,
    disabled,
    styleConfig,
    fieldSize,
    isPII,
    // Select/Radio specific props to be filtered from rest
    options,
    labelKey,
    valueKey,
    isMulti,
    isSearchable,
    isClearable,
    loadingMessage,
    noOptionsMessage,
    loadOptions,
    defaultOptions,
    cacheOptions,
    allowCreate,
    ...rest
  } = allProps;

  const generatedId = useId();
  const id = externalId || `${type}-${generatedId}`;

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <TextAreaField
            {...(rest as TextAreaProps)}
            ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
            id={id}
            disabled={disabled}
            required={required}
            error={error}
            isPII={isPII}
            fieldSize={fieldSize}
          />
        );

      case "select":
        return (
          <CustomSelect
            {...(rest as SelectFieldProps)}
            label={label}
            ref={ref as React.ForwardedRef<HTMLDivElement>}
            id={id}
            disabled={disabled}
            aria-invalid={!!error}
            options={options}
            labelKey={labelKey}
            valueKey={valueKey}
            isMulti={isMulti}
            isSearchable={isSearchable}
            isClearable={isClearable}
            loadingMessage={loadingMessage}
            noOptionsMessage={noOptionsMessage}
            loadOptions={loadOptions}
            defaultOptions={defaultOptions}
            cacheOptions={cacheOptions}
            allowCreate={allowCreate}
            fieldSize={fieldSize}
          />
        );

      case "date":
        return (
          <CustomDatePicker
            {...(rest as DateFieldProps)}
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            id={id}
            disabled={disabled}
            aria-invalid={!!error}
          />
        );

      case "checkbox":
        return (
          <CheckboxField
            {...(rest as CheckboxFieldProps)}
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            id={id}
            disabled={disabled}
            required={required}
            error={error}
            label={label}
            styleConfig={styleConfig}
          />
        );

      case "radio":
        return (
          <RadioField
            {...(rest as RadioFieldProps)}
            id={id}
            disabled={disabled}
            required={required}
            error={error}
            options={options || []}
            labelKey={labelKey}
            valueKey={valueKey}
            styleConfig={styleConfig}
          />
        );

      case "text":
      case "email":
      case "password":
      case "number":
      default:
        return (
          <InputField
            {...(rest as TextFieldProps)}
            ref={ref as React.ForwardedRef<HTMLInputElement>}
            id={id}
            type={type}
            disabled={disabled}
            required={required}
            error={error}
            isPII={isPII}
            fieldSize={fieldSize}
          />
        );
    }
  };

  return (
    <FormFieldWrapper
      id={id}
      label={label}
      hint={hint}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      wrapperClassName={wrapperClassName}
      hideLabel={type === "checkbox"}
      styleConfig={styleConfig}
    >
      {renderInput()}
    </FormFieldWrapper>
  );
});

FormField.displayName = "FormField";
