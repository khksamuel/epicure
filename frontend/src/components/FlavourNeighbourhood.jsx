import { humanName, scoreText } from "../utils/format";

export function FlavourNeighbourhood({ ingredient, modes }) {
  return (
    <section className="mt-16 border-t border-ink/15 pt-10">
      <h2 className="font-display text-3xl tracking-[-.02em]">A wider flavour neighbourhood</h2>
      <p className="mt-2 max-w-[58ch] text-sm leading-6 text-pencil">
        The broad clusters that sit near {humanName(ingredient || "miso")}.
      </p>
      <div className="mt-6 grid border-y border-ink/15 sm:grid-cols-3 sm:divide-x sm:divide-ink/15">
        {(modes || []).map((mode) => (
          <div
            className="border-b border-ink/15 p-5 last:border-b-0 sm:border-b-0"
            key={mode.mode_id}
          >
            <strong className="block font-display text-lg">{humanName(mode.label)}</strong>
            <span className="mt-2 block font-mono text-[10px] font-semibold tabular-nums text-moss">
              {scoreText(mode.score)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
