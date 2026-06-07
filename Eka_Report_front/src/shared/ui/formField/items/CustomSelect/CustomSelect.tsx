import { forwardRef } from "react";
import type { CustomSelectProps } from "../../types/types";
import { useCustomSelect } from "./hooks/useCustomSelect";
import { SelectControl } from "./items/SelectControl";
import { SelectMenu } from "./items/SelectMenu";

/**
 * CustomSelect - A premium, accessible select component supporting
 * single/multi select, search, and async loading with pagination.
 */
const CustomSelect = forwardRef<HTMLDivElement, CustomSelectProps>(
  (props, ref) => {
    const {
      id,
      className,
      placeholder = "Select option...",
      labelKey = "label",
      valueKey = "value",
      isMulti = false,
      isSearchable = false,
      isClearable = false,
      loadingMessage,
      noOptionsMessage,
      disabled,
      fieldSize,
      ...rest
    } = props;

    const {
      isOpen,
      setIsOpen,
      searchTerm,
      setSearchTerm,
      handleSearchChange,
      highlightedIndex,
      setHighlightedIndex,
      isLoading,
      isLoadingMore,
      hasMore,
      filteredOptions,
      selectedOptions,
      selectedValues,
      hasValue,
      isAsync,
      containerRef,
      inputRef,
      listRef,
      sentinelRef,
      handleSelectOption,
      handleClear,
      handleRemoveMulti,
      handleKeyDown,
    } = useCustomSelect(props);

    return (
      <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
        <SelectControl
          id={id}
          disabled={disabled}
          isMulti={isMulti}
          isSearchable={isSearchable}
          isAsync={isAsync}
          isClearable={isClearable}
          placeholder={placeholder}
          searchTerm={searchTerm}
          selectedOptions={selectedOptions}
          hasValue={hasValue}
          isLoading={isLoading}
          isOpen={isOpen}
          labelKey={labelKey}
          valueKey={valueKey}
          className={className}
          ariaInvalid={rest["aria-invalid"]}
          inputRef={inputRef}
          onSearchChange={handleSearchChange}
          onToggle={() => setIsOpen((prev) => !prev)}
          onClear={handleClear}
          onRemoveMulti={handleRemoveMulti}
          forwardedRef={ref}
        />

        <SelectMenu
          isOpen={isOpen}
          disabled={disabled}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          filteredOptions={filteredOptions}
          selectedValues={selectedValues}
          highlightedIndex={highlightedIndex}
          loadingMessage={loadingMessage}
          noOptionsMessage={noOptionsMessage}
          labelKey={labelKey}
          valueKey={valueKey}
          onSelect={handleSelectOption}
          onHighlight={setHighlightedIndex}
          listRef={listRef}
          sentinelRef={sentinelRef}
        />
      </div>
    );
  },
);

CustomSelect.displayName = "CustomSelect";

export { CustomSelect };

