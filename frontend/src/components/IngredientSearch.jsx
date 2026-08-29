import { IngredientAutocomplete } from "./IngredientAutocomplete";

export function IngredientSearch({ value, onChange, onSubmit, message, isError = false }) {
  return (
    <section className="paper-section p-5 sm:p-7">
      <div className="grid gap-6 md:grid-cols-[.8fr_1.2fr] md:items-center">
        <div>
          <h2 className="font-display text-3xl leading-tight tracking-[-.02em]">
            Start with what is on your bench.
          </h2>
          <p className="mt-2 max-w-[42ch] text-sm leading-6 text-pencil">
            Find familiar pairings, balanced possibilities, and flavour surprises.
          </p>
        </div>
        <div>
          <label className="sr-only" htmlFor="ingredient">
            Ingredient
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <IngredientAutocomplete
              className="flex-1"
              id="ingredient"
              value={value}
              onChange={onChange}
              onEnter={onSubmit}
              placeholder="Search an ingredient"
            />
            <button className="action action-primary shrink-0" onClick={onSubmit}>
              Show possibilities
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 min-h-5 text-sm font-medium text-clay" role={isError ? "alert" : "status"}>
        {message}
      </p>
    </section>
  );
}
