import { useEffect, useMemo, useRef, useState } from "react";

type AutocompleteProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: any[];
  onSelect?: (item: any) => void;
  onEnter?: () => void;
  exclude?: any[];
  getOptionLabel?: (item: any) => string;
  getOptionValue?: (item: any) => string;
  placeholder?: string;
  className?: string;
  closeOnSelect?: boolean;
  clearOnSelect?: boolean;
};

export function Autocomplete({
  id,
  value,
  onChange,
  options,
  onSelect,
  onEnter,
  exclude = [],
  getOptionLabel = String,
  getOptionValue = getOptionLabel,
  placeholder = "Search or choose",
  className = "",
  closeOnSelect = true,
  clearOnSelect = false,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [filterFromValue, setFilterFromValue] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const excluded = useMemo(
    () => new Set(exclude.map((item) => String(item).toLowerCase())),
    [exclude],
  );
  const matches = useMemo(() => {
    const search = filterFromValue ? value.trim().toLowerCase() : "";
    return options
      .filter((item) => !excluded.has(String(getOptionValue(item)).toLowerCase()))
      .filter((item) => !search || getOptionLabel(item).toLowerCase().includes(search))
      .sort(
        (left, right) =>
          Number(getOptionLabel(right).toLowerCase().startsWith(search)) -
          Number(getOptionLabel(left).toLowerCase().startsWith(search)),
      )
      .slice(0, 8);
  }, [excluded, filterFromValue, getOptionLabel, getOptionValue, options, value]);

  useEffect(() => {
    const closeWhenOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeWhenOutside);
    return () => document.removeEventListener("pointerdown", closeWhenOutside);
  }, []);

  const selectedIndex = Math.min(Math.max(activeIndex, 0), Math.max(matches.length - 1, 0));

  const select = (item) => {
    onChange(clearOnSelect ? "" : getOptionLabel(item));
    onSelect?.(item);
    setFilterFromValue(false);
    setOpen(!closeOnSelect);
    setActiveIndex(0);
    if (!closeOnSelect) requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <input
        ref={inputRef}
        id={id}
        className="field w-full"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setFilterFromValue(true);
          setOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => {
          setFilterFromValue(false);
          setOpen(true);
          setActiveIndex(0);
        }}
        onClick={() => {
          if (!open) {
            setFilterFromValue(false);
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            if (matches.length)
              setActiveIndex((current) => Math.min(current + 1, matches.length - 1));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            if (matches.length) setActiveIndex((current) => Math.max(current - 1, 0));
          }
          if (event.key === "Home" && open && matches.length) {
            event.preventDefault();
            setActiveIndex(0);
          }
          if (event.key === "End" && open && matches.length) {
            event.preventDefault();
            setActiveIndex(matches.length - 1);
          }
          if (event.key === "Enter") {
            event.preventDefault();
            if (open && matches[selectedIndex]) select(matches[selectedIndex]);
            else onEnter?.();
          }
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={`${id}-suggestions`}
        aria-activedescendant={
          open && matches[selectedIndex] ? `${id}-option-${selectedIndex}` : undefined
        }
        aria-expanded={open}
      />
      {open && (
        <div
          id={`${id}-suggestions`}
          className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-ink/15 bg-paper p-1 text-ink shadow-[0_18px_45px_rgb(37_53_47/.16)]"
          role="listbox"
        >
          {matches.length > 0 ? (
            matches.map((item, index) => (
              <button
                id={`${id}-option-${index}`}
                type="button"
                role="option"
                aria-selected={selectedIndex === index}
                tabIndex={-1}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${selectedIndex === index ? "bg-leaf/20 text-ink" : "hover:bg-leaf/20 focus:bg-leaf/20"}`}
                key={getOptionValue(item)}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => select(item)}
              >
                {getOptionLabel(item)}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-pencil">No matching option.</p>
          )}
        </div>
      )}
    </div>
  );
}
