import { useState } from "react";
import { useDirections, useRecipeIdeas } from "../hooks/useKitchenQueries";
import { humanName, normaliseIngredient } from "../utils/format";
import { IngredientPicker } from "./IngredientPicker";
import { Autocomplete } from "./Autocomplete";

const DIETARY_OPTIONS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "low sodium",
  "halal",
  "kosher",
];

function CreativeCards({ data, focus, pantryOnly, pantry }) {
  const pantrySet = new Set(pantry.map(normaliseIngredient));
  const groups = [
    ["familiar", "A familiar idea", data.familiarIdeas],
    ["balanced", "A balanced idea", data.balancedIdeas],
    ["surprising", "A surprising idea", data.surprisingIdeas],
  ].sort(([left], [right]) => (left === focus ? -1 : right === focus ? 1 : 0));
  return (
    <div className="mt-8 grid overflow-hidden rounded-xl border border-ink/15 bg-paper md:grid-cols-3 md:divide-x md:divide-ink/15">
      {groups.map(([key, title, ideas]) => {
        const visibleIdeas = pantryOnly
          ? ideas?.filter((idea) => pantrySet.has(normaliseIngredient(idea.ingredient)))
          : ideas;
        return (
          <article
            className={`border-b border-ink/15 p-5 last:border-b-0 md:border-b-0 ${key === focus ? "bg-leaf/10" : ""}`}
            key={key}
          >
            <h3 className="font-display text-2xl tracking-[-.02em] text-ink">{title}</h3>
            <ul className="mt-5 space-y-3 text-sm text-pencil">
              {visibleIdeas?.length ? (
                visibleIdeas.map((idea) => (
                  <li
                    className="border-b border-ink/10 pb-3 last:border-0"
                    key={idea.ingredient}
                    title={idea.reason || "No reason provided."}
                  >
                    {humanName(idea.ingredient)}
                  </li>
                ))
              ) : (
                <li className="text-pencil/70">
                  {pantryOnly ? "No pantry match in this lens." : "No idea found yet."}
                </li>
              )}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

export function CreativeRecipeForm({ standalone: _standalone = false }: { standalone?: boolean }) {
  const [recipe, setRecipe] = useState({
    title: "My next dish",
    ingredients: ["mushroom", "rice", "garlic"],
    cuisine: "",
    dietaryNotes: "",
  });
  const [focus, setFocus] = useState("balanced");
  const [cuisineQuery, setCuisineQuery] = useState("");
  const [pantryOnly, setPantryOnly] = useState(false);
  const [pantry, setPantry] = useState([]);
  const directions = useDirections();
  const mutation = useRecipeIdeas();
  const update = (key, value) => setRecipe((current) => ({ ...current, [key]: value }));
  const submit = () =>
    mutation.mutate({
      ...recipe,
      ingredients: recipe.ingredients,
      title: recipe.title || "My next dish",
      suggestionsPerStyle: pantryOnly ? 12 : 5,
    });
  const message = mutation.isError ? "We could not explore this recipe." : "";
  const canSubmit = recipe.ingredients.length > 0 && !mutation.isPending;

  return (
    <section className="paper-section mt-16 grid gap-10 p-6 sm:p-9 lg:grid-cols-[.65fr_1.35fr] lg:gap-14">
      <div>
        <h2 className="section-title">Give me ideas for this recipe.</h2>
        <p className="section-copy">
          Add the ingredients you already have. Epicure will offer a familiar idea, a balanced idea,
          and a surprising idea.
        </p>
        <p className="mt-8 border-t border-ink/15 pt-4 font-display text-lg italic leading-7 text-moss">
          Treat each suggestion as a note in the margin, not an instruction.
        </p>
      </div>
      <div>
        <fieldset className="mb-6">
          <legend className="text-sm font-semibold text-ink/75">Creative direction</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["familiar", "Keep it familiar"],
              ["balanced", "Add balance"],
              ["surprising", "Take a risk"],
            ].map(([value, label]) => (
              <button
                type="button"
                aria-pressed={focus === value}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${focus === value ? "bg-moss text-paper" : "border border-ink/15 text-pencil hover:bg-leaf/20"}`}
                onClick={() => setFocus(value)}
                key={value}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-6">
          <label className="grid gap-2 text-sm font-semibold text-ink/75" htmlFor="recipe-title">
            Recipe name
            <input
              className="field"
              id="recipe-title"
              value={recipe.title}
              onChange={(event) => update("title", event.target.value)}
            />
          </label>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-ink/75" htmlFor="recipe-ingredients">
              What is already in it?
            </label>
            <IngredientPicker
              value={recipe.ingredients}
              onChange={(value) => update("ingredients", value)}
            />
            <small className="text-xs text-pencil">
              Search and select ingredients to add them to the recipe.
            </small>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-ink/75"
                htmlFor="recipe-cuisine"
              >
                Cooking style
              </label>
              <Autocomplete
                id="recipe-cuisine"
                value={cuisineQuery}
                onChange={(value) => {
                  setCuisineQuery(value);
                  update("cuisine", value);
                }}
                onSelect={(value) => update("cuisine", value)}
                options={directions.data || []}
                getOptionLabel={humanName}
                getOptionValue={(value) => value}
                placeholder="Choose a cooking style"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink/75" htmlFor="recipe-diet">
                Dietary notes
              </label>
              <Autocomplete
                id="recipe-diet"
                value={recipe.dietaryNotes}
                onChange={(value) => update("dietaryNotes", value)}
                onSelect={(value) => update("dietaryNotes", value)}
                options={DIETARY_OPTIONS}
                placeholder="For example: vegetarian"
              />
            </div>
          </div>
          <div className="rounded-xl border border-ink/15 bg-linen/55 p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
              <input
                className="size-4 accent-moss"
                type="checkbox"
                checked={pantryOnly}
                onChange={(event) => setPantryOnly(event.target.checked)}
              />
              Only suggest ingredients from my pantry
            </label>
            {pantryOnly && (
              <div className="mt-4">
                <label
                  className="mb-2 block text-sm font-semibold text-ink/75"
                  htmlFor="pantry-ingredients"
                >
                  Pantry ingredients
                </label>
                <IngredientPicker
                  id="pantry-ingredients"
                  label="Pantry ingredients"
                  value={pantry}
                  onChange={setPantry}
                />
                <p className="mt-2 text-xs text-pencil">
                  Add the ingredients that are available today.
                </p>
              </div>
            )}
          </div>
        </div>
        <button
          className="action action-primary mt-6 w-full sm:w-auto"
          onClick={submit}
          disabled={!canSubmit}
        >
          {mutation.isPending ? "Exploring the dish." : "Suggest my next ingredient"}
        </button>
        <p className="mt-3 min-h-5 text-sm text-clay" role={mutation.isError ? "alert" : "status"}>
          {message}
        </p>
        {mutation.data && (
          <CreativeCards
            data={mutation.data}
            focus={focus}
            pantryOnly={pantryOnly}
            pantry={pantry}
          />
        )}
      </div>
    </section>
  );
}
