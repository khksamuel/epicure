import { useState } from "react";
import { DirectionExplorer } from "../components/DirectionExplorer";
import { IngredientSearch } from "../components/IngredientSearch";
import { PageIntro } from "../components/PageIntro";
import { normaliseIngredient } from "../utils/format";

export function SteerPage() {
  const [draftIngredient, setDraftIngredient] = useState("miso");
  const [ingredient, setIngredient] = useState("miso");
  const submit = () => {
    const nextIngredient = normaliseIngredient(draftIngredient);
    if (nextIngredient) setIngredient(nextIngredient);
  };
  return (
    <>
      <PageIntro
        title="Steer flavour."
        description="Choose a cuisine direction and use the creativity dial to decide how far the ingredient should move."
        note="A small angle stays close. A larger angle is a more adventurous step."
      />
      <IngredientSearch
        value={draftIngredient}
        onChange={setDraftIngredient}
        onSubmit={submit}
        message=""
      />
      <DirectionExplorer ingredient={ingredient} standalone />
    </>
  );
}
