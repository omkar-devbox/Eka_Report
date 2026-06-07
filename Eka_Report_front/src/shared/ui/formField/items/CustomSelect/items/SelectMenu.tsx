import { cn } from "../../../utils";
import type { SelectMenuProps } from "../types/CustomSelect.types";
import { SelectSpinner } from "./SelectSpinner";
import { SelectOption } from "./SelectOption";
import { getOptionValue } from "../utils/select-utils";
import { selectStyles } from "../styles/style";

export const SelectMenu = ({
  isOpen,
  disabled,
  isLoading,
  isLoadingMore,
  hasMore,
  filteredOptions,
  selectedValues,
  highlightedIndex,
  loadingMessage = "Loading…",
  noOptionsMessage = "No options found",
  labelKey,
  valueKey,
  onSelect,
  onHighlight,
  listRef,
  sentinelRef,
}: SelectMenuProps) => {
  if (!isOpen || disabled) return null;

  return (
    <div ref={listRef} className={selectStyles.menu}>
      {isLoading ? (
        <div className={cn("flex items-center gap-2", selectStyles.message)}>
          <SelectSpinner />
          {loadingMessage}
        </div>
      ) : filteredOptions.length === 0 ? (
        <div className={selectStyles.message}>{noOptionsMessage}</div>
      ) : (
        <>
          {filteredOptions.map((opt, idx) => {
            const optValue = getOptionValue(opt, valueKey);
            const isSelected = selectedValues.includes(optValue);
            const isHighlighted = idx === highlightedIndex;

            return (
              <SelectOption
                key={`${String(optValue != null ? optValue : idx)}-${idx}`}
                option={opt}
                index={idx}
                labelKey={labelKey}
                valueKey={valueKey}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                onSelect={onSelect}
                onHighlight={onHighlight}
              />
            );
          })}

          {/* Infinite-scroll sentinel */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center gap-2 px-3 py-2"
            >
              {isLoadingMore ? (
                <>
                  <SelectSpinner small />
                  <span className="text-xs text-gray-400">
                    Loading more…
                  </span>
                </>
              ) : (
                <span className="h-1 w-full" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
