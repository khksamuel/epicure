import { useEffect, useMemo, useRef, useState } from "react";

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
}) {
  const [open, setOpen] = useState(false);
  const [filterFromValue, setFilterFromValue] = useState(false);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
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

  const select = (item) => {
    onChange(clearOnSelect ? "" : getOptionLabel(item));
    onSelect?.(item);
    setFilterFromValue(false);
    setOpen(!closeOnSelect);
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
        }}
        onFocus={() => {
          setFilterFromValue(false);
          setOpen(true);
        }}
        onClick={() => {
          if (!open) {
            setFilterFromValue(false);
            setOpen(true);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (open && matches[0]) select(matches[0]);
            else onEnter?.();
          }
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={`${id}-suggestions`}
        aria-expanded={open}
      />
      {open && (
        <div
          id={`${id}-suggestions`}
          className="absolute z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-ink/15 bg-paper p-1 text-ink shadow-[0_18px_45px_rgb(37_53_47/.16)]"
          role="listbox"
        >
          {matches.length > 0 ? (
            matches.map((item) => (
              <button
                type="button"
                role="option"
                className="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-leaf/20 focus:bg-leaf/20"
                key={getOptionValue(item)}
                onMouseDown={(event) => event.preventDefault()}
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
