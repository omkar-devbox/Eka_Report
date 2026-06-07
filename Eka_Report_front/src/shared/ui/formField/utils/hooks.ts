import React from "react";

/**
 * useNumberInput - Logic to restrict input to digits only for type='number'
 */
export const useNumberInput = (type: string, onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (type === "number") {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];
      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
      if (!/^\d$/.test(e.key)) e.preventDefault();
    }
    if (onKeyDown) onKeyDown(e);
  };

  return { handleKeyDown };
};

/**
 * usePII - Logic for masking/unmasking PII fields
 */
export const usePII = (isPII: boolean, type: string) => {
  const [isMasked, setIsMasked] = React.useState(true);
  const toggleMask = () => setIsMasked((prev) => !prev);

  const inputType = isPII
    ? isMasked
      ? "password"
      : type === "password"
        ? "text"
        : type
    : type;

  return { isMasked, toggleMask, inputType };
};
