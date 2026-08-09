"use client";

import { suggestMatches } from "@/components/starkizard/games/normalizeGuess";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type GuessAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function GuessAutocomplete({
  value,
  onChange,
  options,
  disabled,
  placeholder,
  className = "",
}: GuessAutocompleteProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const suggestions = useMemo(
    () => suggestMatches(value, options, 8),
    [value, options],
  );

  const showList = open && !disabled && value.trim().length > 0 && suggestions.length > 0;

  useEffect(() => {
    setHighlight(0);
  }, [value, showList]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function pick(label: string) {
    onChange(label);
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showList) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (event.key === "Enter" && suggestions[highlight]) {
      const selected = suggestions[highlight];
      if (value.trim().toLowerCase() !== selected.toLowerCase()) {
        event.preventDefault();
        pick(selected);
      } else {
        setOpen(false);
      }
    }
  }

  return (
    <div ref={rootRef} className={`relative min-w-0 flex-1 ${className}`}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList ? `${listId}-opt-${highlight}` : undefined
        }
        className="w-full rounded-full border border-white/15 bg-sz-void px-4 py-2.5 text-base text-sz-mist outline-none focus:border-sz-jade/60 disabled:opacity-50"
        autoComplete="off"
        spellCheck={false}
      />
      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-2xl border border-white/12 bg-sz-panel py-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
        >
          {suggestions.map((label, index) => {
            const active = index === highlight;
            return (
              <li key={label} role="presentation">
                <button
                  id={`${listId}-opt-${index}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setHighlight(index)}
                  onMouseDown={(e) => {
                    // Keep focus / avoid input blur before pick.
                    e.preventDefault();
                    pick(label);
                  }}
                  className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                    active
                      ? "bg-sz-jade/15 text-sz-jade"
                      : "text-sz-mist/85 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
