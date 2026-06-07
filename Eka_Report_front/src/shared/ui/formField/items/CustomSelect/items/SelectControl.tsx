import { cn } from "../../../utils";
import { ChevronDownIcon, XIcon } from "../../../icons";
import type { SelectControlProps } from "../types/CustomSelect.types";
import { SelectMultiBadge } from "./SelectMultiBadge";
import { SelectSpinner } from "./SelectSpinner";
import { getOptionLabel } from "../utils/select-utils";
import { selectStyles } from "../styles/style";

export const SelectControl = ({
  id,
  disabled,
  isMulti,
  isSearchable,
  isAsync,
  isClearable,
  placeholder,
  searchTerm,
  selectedOptions,
  hasValue,
  isLoading,
  isOpen,
  labelKey,
  valueKey,
  className,
  ariaInvalid,
  inputRef,
  onSearchChange,
  onToggle,
  onClear,
  onRemoveMulti,
  forwardedRef,
}: SelectControlProps) => {
  const showPlaceholder = isMulti
    ? selectedOptions.length === 0
    : selectedOptions.length === 0 && !searchTerm;

  return (
    <div
      ref={forwardedRef}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        selectStyles.control,
        disabled && selectStyles.disabled,
        ariaInvalid && selectStyles.error,
        className,
      )}
      onFocus={(e) => {
        if (disabled) return;
        // If the div itself was focused (e.g. via Tab), move focus to the input
        if (e.target === e.currentTarget && (isSearchable || isAsync)) {
          inputRef.current?.focus();
        }
      }}
      onClick={() => {
        if (disabled) return;
        // The menu should toggle when clicking the control area.
        // We only prevent toggle if clicking the clear button (XIcon).
        onToggle();
        if (isSearchable || isAsync) inputRef.current?.focus();
      }}
    >
      <div className={selectStyles.contentArea}>
        {/* Multi-select badges */}
        {isMulti &&
          selectedOptions.map((opt, i) => (
            <SelectMultiBadge
              key={i}
              option={opt}
              labelKey={labelKey}
              valueKey={valueKey}
              onRemove={onRemoveMulti}
            />
          ))}

        {!isMulti && !searchTerm && selectedOptions.length > 0 && !isOpen && (
          <span className={selectStyles.selectedLabel}>
            {(() => {
              const opt = selectedOptions[0];
              const label = getOptionLabel(opt, labelKey) as any;
              if (typeof label === "string") {
                const match = label.match(/^(?:\+Add\s+.*?|➕ Create\s+)["']?([^"']+)["']?$/);
                if (match) {
                  return match[1];
                }
              }
              if ((opt as any).isNew) {
                return (opt.value || label) as any;
              }
              return label as any;
            })()}
          </span>
        )}

        {/* Placeholder */}
        {showPlaceholder && !searchTerm && (
          <span className={selectStyles.placeholder}>{placeholder}</span>
        )}

        {/* Search input - Acts as the primary interaction point for labels */}
        <input
          id={id}
          ref={inputRef}
          disabled={disabled}
          readOnly={!isSearchable && !isAsync}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            selectStyles.input,
            !isSearchable && !isAsync && "w-0 opacity-0 cursor-pointer",
            !isMulti && !searchTerm && hasValue && !isOpen && "w-0 opacity-0",
            (isMulti || searchTerm || !hasValue || isOpen) && "flex-1",
          )}
          size={1}
          aria-autocomplete={isAsync ? "list" : undefined}
          tabIndex={-1}
        />
      </div>

      {/* Right indicators */}
      <div className={selectStyles.indicators}>
        {isLoading && <SelectSpinner />}
        {isClearable && hasValue && !isLoading && (
          <XIcon
            className="h-4 w-4 cursor-pointer hover:text-[color:var(--ff-activeBorder,var(--primary))]"
            onClick={(e) => {
              e.stopPropagation();
              onClear(e);
            }}
          />
        )}
        {isClearable && !isLoading && (
          <span className="w-px h-4 bg-gray-300" />
        )}
        {disabled ? (
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
            className="text-text-muted/60"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        ) : (
          <ChevronDownIcon
            className={cn(
              "h-4 w-4 transition-transform duration-200 cursor-pointer",
              isOpen ? "rotate-180 text-[color:var(--ff-activeBorder,var(--primary))]" : "text-gray-400",
            )}
          />
        )}
      </div>
    </div>
  );
};
