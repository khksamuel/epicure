import { useState } from "react";
import { useIngredientComparison } from "../hooks/useKitchenQueries";
import { humanName, normaliseIngredient } from "../utils/format";
import { IngredientChip } from "./IngredientChip";
import { IngredientAutocomplete } from "./IngredientAutocomplete";

const LENSES = [
  ["cooc", "Common"],
  ["core", "Balanced"],
  ["chem", "Chemistry"],
];

export function IngredientCompare() {
  const [draftLeft, setDraftLeft] = useState("miso");
  const [draftRight, setDraftRight] = useState("soy sauce");
  const [ingredients, setIngredients] = useState(["miso", "soy_sauce"]);
  const [lens, setLens] = useState("core");
  const comparison = useIngredientComparison(...ingredients);

  const compare = () => {
    const left = normaliseIngredient(draftLeft);
    const right = normaliseIngredient(draftRight);
    if (left && right && left !== right) setIngredients([left, right]);
  };

  const results = [comparison.left.data?.[lens] || [], comparison.right.data?.[lens] || []];
  const pending = comparison.left.isPending || comparison.right.isPending;
  const error = comparison.left.isError || comparison.right.isError;

  return (
    <section className="paper-section p-6 sm:p-8">
      <h2 className="font-display text-3xl tracking-[-.02em]">Compare two ingredients</h2>
      <p className="section-copy">
        See how each ingredient's neighbourhood changes under the same model lens.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="grid gap-2 text-sm font-semibold text-ink/75">
          First ingredient
          <IngredientAutocomplete
            id="compare-first-ingredient"
            value={draftLeft}
            onChange={setDraftLeft}
            onEnter={compare}
            exclude={[draftRight]}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-ink/75">
          Second ingredient
          <IngredientAutocomplete
            id="compare-second-ingredient"
            value={draftRight}
            onChange={setDraftRight}
            onEnter={compare}
            exclude={[draftLeft]}
          />
        </label>
        <button
          className="action action-primary"
          onClick={compare}
          disabled={!draftLeft.trim() || !draftRight.trim()}
        >
          Compare
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2" aria-label="Comparison lens">
        {LENSES.map(([value, label]) => (
          <button
            aria-pressed={lens === value}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${lens === value ? "bg-moss text-paper" : "border border-ink/15 text-pencil hover:bg-leaf/20"}`}
            onClick={() => setLens(value)}
            key={value}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-5 text-sm font-medium text-clay" role="alert">
          We could not compare those ingredients. Check their names and try again.
        </p>
      )}
      {pending ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-xl bg-linen" />
          <div className="h-40 animate-pulse rounded-xl bg-linen" />
        </div>
      ) : (
        <div className="mt-6 grid border-y border-ink/15 sm:grid-cols-2 sm:divide-x sm:divide-ink/15">
          {ingredients.map((ingredient, index) => (
            <article className="p-5 sm:p-6" key={ingredient}>
              <h3 className="font-display text-2xl tracking-[-.02em]">{humanName(ingredient)}</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {results[index].map((item) => (
                  <IngredientChip item={item} key={item.ingredient} />
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
