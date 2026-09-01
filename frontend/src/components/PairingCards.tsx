import { IngredientChip } from "./IngredientChip";

const MODEL_COPY = {
  cooc: ["Common pairings", "What recipes often put together.", "Recipe patterns"],
  core: [
    "Balanced possibilities",
    "A meeting point between recipes and flavour chemistry.",
    "Recipes + chemistry",
  ],
  chem: ["Flavour surprises", "A related flavour-compound profile.", "Flavour compounds"],
};

export function PairingCards({ data }) {
  return (
    <div className="grid overflow-hidden rounded-2xl border border-ink/15 bg-paper md:grid-cols-3 md:divide-x md:divide-ink/15">
      {Object.entries(MODEL_COPY).map(([model, [title, copy, label]]) => (
        <article
          className="group flex min-h-72 flex-col border-b border-ink/15 p-6 transition duration-200 last:border-b-0 hover:bg-leaf/8 md:border-b-0"
          key={model}
        >
          <div className="mb-12 flex items-center justify-between">
            <span className="text-xs font-semibold text-moss">{label}</span>
            <span className="font-mono text-[10px] font-semibold tracking-wider text-pencil/70">
              {model.toUpperCase()}
            </span>
          </div>
          <h3 className="font-display text-3xl leading-tight tracking-[-.02em]">{title}</h3>
          <p className="mt-2 max-w-[30ch] text-sm leading-6 text-pencil">{copy}</p>
          <div className="mt-auto flex flex-wrap gap-2 pt-7">
            {(data[model] || []).length ? (
              (data[model] || []).map((item) => (
                <IngredientChip item={item} key={item.ingredient} />
              ))
            ) : (
              <p className="text-sm text-pencil">No suggestions from this lens yet.</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
