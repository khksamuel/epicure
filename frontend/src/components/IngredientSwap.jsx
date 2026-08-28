import { useState } from "react";
import { usePairingSearch } from "../hooks/useKitchenQueries";
import { humanName, normaliseIngredient } from "../utils/format";
import { IngredientChip } from "./IngredientChip";
import { IngredientPicker } from "./IngredientPicker";
import { IngredientAutocomplete } from "./IngredientAutocomplete";

export function IngredientSwap() {
  const [draftIngredient, setDraftIngredient] = useState("butter");
  const [context, setContext] = useState(["mushroom", "garlic"]);
  const [lens, setLens] = useState("core");
  const mutation = usePairingSearch();

  const submit = () => {
    const ingredient = normaliseIngredient(draftIngredient);
    if (ingredient) mutation.mutate(ingredient);
  };

  const alternatives = (mutation.data?.[lens] || []).filter(
    (item) => !context.includes(item.ingredient),
  );

  return (
    <section className="paper-section grid gap-10 p-6 sm:p-9 lg:grid-cols-[.8fr_1.2fr]">
      <div>
        <h2 className="section-title">Find another way to play the same part.</h2>
        <p className="section-copy">
          Choose the ingredient to replace, add the dish context, and select the lens that matters
          most.
        </p>
        <p className="mt-7 border-t border-ink/15 pt-4 text-sm leading-6 text-pencil">
          These are flavour-neighbour alternatives. Technique and physical function still need the
          cook's judgement.
        </p>
      </div>
      <div>
        <label className="grid gap-2 text-sm font-semibold text-ink/75">
          Ingredient to replace
          <IngredientAutocomplete
            id="swap-ingredient"
            value={draftIngredient}
            onChange={setDraftIngredient}
            onEnter={submit}
            exclude={context}
          />
        </label>
        <div className="mt-5 grid gap-2">
          <label className="text-sm font-semibold text-ink/75" htmlFor="swap-context">
            What else is in the dish?
          </label>
          <IngredientPicker
            id="swap-context"
            label="Dish context ingredients"
            value={context}
            onChange={setContext}
          />
        </div>
        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-ink/75">Replacement lens</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["cooc", "Common"],
              ["core", "Balanced"],
              ["chem", "Chemistry"],
            ].map(([value, label]) => (
              <button
                type="button"
                aria-pressed={lens === value}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${lens === value ? "bg-moss text-paper" : "border border-ink/15 text-pencil hover:bg-leaf/20"}`}
                onClick={() => setLens(value)}
                key={value}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <button
          className="action action-primary mt-6"
          onClick={submit}
          disabled={mutation.isPending || !draftIngredient.trim()}
        >
          {mutation.isPending ? "Looking for alternatives" : "Find alternatives"}
        </button>
        {mutation.isError && (
          <p className="mt-4 text-sm font-medium text-clay" role="alert">
            We could not find alternatives for that ingredient.
          </p>
        )}
        {mutation.data && (
          <div className="mt-7 border-t border-ink/15 pt-5">
            <h3 className="font-display text-2xl">
              Try in place of {humanName(normaliseIngredient(draftIngredient))}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {alternatives.map((item) => (
                <IngredientChip item={item} key={item.ingredient} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
