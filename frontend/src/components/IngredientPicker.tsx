import { useState } from "react";
import { humanName, normaliseIngredient } from "../utils/format";
import { IngredientAutocomplete } from "./IngredientAutocomplete";

export function IngredientPicker({
  value,
  onChange,
  id = "recipe-ingredients",
  label = "Selected ingredients",
}) {
  const [query, setQuery] = useState("");
  const selected = new Set(value);

  const add = (item) => {
    const ingredient = normaliseIngredient(item);
    if (!selected.has(ingredient)) onChange([...value, ingredient]);
    setQuery("");
  };
  const remove = (item) => onChange(value.filter((ingredient) => ingredient !== item));

  return (
    <div className="relative">
      <IngredientAutocomplete
        id={id}
        value={query}
        onChange={setQuery}
        onSelect={add}
        exclude={value}
        closeOnSelect={false}
        clearOnSelect
      />
      <div className="mt-3 flex flex-wrap gap-2" aria-label={label}>
        {value.map((item) => (
          <span
            className="inline-flex items-center gap-2 rounded-full border border-moss/20 bg-leaf/20 px-3 py-2 text-sm text-ink"
            key={item}
          >
            {humanName(item)}
            <button
              className="text-xs font-semibold text-moss/70 hover:text-moss"
              type="button"
              onClick={() => remove(item)}
              aria-label={`Remove ${humanName(item)}`}
            >
              Remove
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
