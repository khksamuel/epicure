import { useState } from "react";
import { useIngredientExploration } from "../hooks/useKitchenQueries";
import { normaliseIngredient, humanName } from "../utils/format";
import styles from "../App.module.css";
import { PageIntro } from "../components/PageIntro";
import { IngredientSearch } from "../components/IngredientSearch";
import { PairingCards } from "../components/PairingCards";
import { FlavourNeighbourhood } from "../components/FlavourNeighbourhood";
import { IngredientCompare } from "../components/IngredientCompare";
import { HowItWorks } from "../components/HowItWorks";

export function ExplorePage() {
  const [draftIngredient, setDraftIngredient] = useState("miso");
  const [ingredient, setIngredient] = useState("miso");
  const { pairings, modes } = useIngredientExploration(ingredient);
  const submit = () => {
    const nextIngredient = normaliseIngredient(draftIngredient);
    if (nextIngredient) setIngredient(nextIngredient);
  };
  return (
    <>
      <PageIntro
        title="Explore an ingredient."
        description="Read one ingredient through recipe patterns, a balanced model, and flavour chemistry."
        note="The three lenses are alternatives, not a ranking."
      />
      <IngredientSearch
        value={draftIngredient}
        onChange={setDraftIngredient}
        onSubmit={submit}
        message={pairings.isError ? "We could not find that ingredient. Try another name." : ""}
        isError={pairings.isError}
      />
      <section className="mt-14">
        <h2 className="section-title">What might work with {humanName(ingredient)}?</h2>
        <p className="section-copy">
          The score shows how strongly each idea is connected inside its own model.
        </p>
        <div className="mt-8">
          {pairings.isPending ? (
            <div
              className="grid gap-4 md:grid-cols-3"
              aria-busy="true"
              aria-label="Loading pairing ideas"
            >
              {[1, 2, 3].map((item) => (
                <div className="h-64 animate-pulse rounded-xl bg-paper/80" key={item} />
              ))}
            </div>
          ) : pairings.isError ? (
            <div className="rounded-xl border border-clay/25 bg-paper/70 p-6 text-sm leading-6 text-pencil">
              Pick an ingredient from the suggestions or check the spelling, then try again.
            </div>
          ) : (
            pairings.data && (
              <div className={styles.resultReveal}>
                <PairingCards data={pairings.data} />
              </div>
            )
          )}
        </div>
      </section>
      <FlavourNeighbourhood ingredient={ingredient} modes={modes.data} />
      <div className="mt-16">
        <IngredientCompare />
      </div>
      <HowItWorks />
    </>
  );
}
