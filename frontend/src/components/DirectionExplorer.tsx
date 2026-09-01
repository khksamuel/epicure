import { useState } from "react";
import { useDirections, useSlerp } from "../hooks/useKitchenQueries";
import { IngredientChip } from "./IngredientChip";
import { humanName } from "../utils/format";
import { Autocomplete } from "./Autocomplete";

const MODEL_OPTIONS = [
  { value: "core", label: "Balanced possibilities" },
  { value: "cooc", label: "Common pairings" },
  { value: "chem", label: "Flavour surprises" },
];

export function DirectionExplorer({ ingredient, standalone: _standalone = false }) {
  const directions = useDirections();
  const mutation = useSlerp();
  const [direction, setDirection] = useState("cuisine:South_Asian");
  const [directionQuery, setDirectionQuery] = useState("South Asian");
  const [model, setModel] = useState("core");
  const [modelQuery, setModelQuery] = useState("Balanced possibilities");
  const [angle, setAngle] = useState(30);
  const options = directions.data || ["cuisine:South_Asian"];
  const submit = () => mutation.mutate({ model, ingredient, direction, angle });
  const message = mutation.isPending
    ? "Finding a new route."
    : mutation.isError
      ? "We could not explore that route. Try another ingredient or direction."
      : "";

  return (
    <section className="paper-section mt-8 grid gap-10 p-6 sm:p-9 lg:grid-cols-[.65fr_1.35fr] lg:gap-14">
      <div>
        <h2 className="section-title">Move the ingredient toward a flavour direction.</h2>
        <p className="section-copy">
          Choose a direction, then decide whether you want a familiar idea or a more adventurous
          one.
        </p>
      </div>
      <div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink/70" htmlFor="direction">
              I am curious about
            </label>
            <Autocomplete
              id="direction"
              value={directionQuery}
              onChange={setDirectionQuery}
              onSelect={setDirection}
              options={options}
              getOptionLabel={humanName}
              getOptionValue={(value) => value}
              placeholder="Choose a flavour direction"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink/70" htmlFor="viewpoint">
              Using the
            </label>
            <Autocomplete
              id="viewpoint"
              value={modelQuery}
              onChange={setModelQuery}
              onSelect={(option) => setModel(option.value)}
              options={MODEL_OPTIONS}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              placeholder="Choose a model lens"
            />
          </div>
        </div>
        <div className="mt-7 border-y border-ink/15 py-5">
          <div className="flex justify-between gap-4 text-xs font-semibold text-pencil">
            <span>Comforting and familiar</span>
            <span>Curious and unexpected</span>
          </div>
          <input
            aria-label="Creativity angle"
            type="range"
            min="5"
            max="80"
            value={angle}
            className="mt-4 w-full accent-moss"
            step="5"
            onInput={(event) => setAngle(Number(event.currentTarget.value))}
            onChange={(event) => setAngle(Number(event.currentTarget.value))}
          />
          <output className="mt-3 block text-sm font-semibold text-moss">
            {angle < 25 ? "A gentle nudge" : angle < 55 ? "A creative step" : "A bold leap"} ·{" "}
            {angle}°
          </output>
        </div>
        <button
          className="action action-primary mt-6"
          onClick={submit}
          disabled={mutation.isPending || !ingredient}
        >
          {mutation.isPending ? "Exploring." : "Explore this direction"}
        </button>
        <p className="mt-3 min-h-5 text-sm text-clay" role={mutation.isError ? "alert" : "status"}>
          {message}
        </p>
        {mutation.data?.length > 0 && (
          <div className="mt-6 border-t border-ink/15 pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-moss">Try these:</span>
              {mutation.data.map((item) => (
                <IngredientChip item={item} key={item.ingredient} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
