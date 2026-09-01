import { humanName, scoreText } from "../utils/format";

export function IngredientChip({ item }) {
  return (
    <span className="inline-flex items-baseline gap-2 rounded-full border border-moss/20 bg-paper px-3 py-2 text-sm text-ink transition hover:border-moss/45 hover:bg-leaf/15">
      {humanName(item.ingredient)}
      <span className="font-mono text-[10px] tabular-nums text-pencil">
        {scoreText(item.score)}
      </span>
    </span>
  );
}
