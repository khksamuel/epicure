import { CreativeRecipeForm } from "../components/CreativeRecipeForm";
import { PageIntro } from "../components/PageIntro";

export function RecipeLabPage() {
  return (
    <>
      <PageIntro
        title="Remix a recipe."
        description="Start with a draft dish, choose how adventurous the next idea should feel, and optionally stay inside your pantry."
        note="Keep the parts that work. Change only what earns its place."
      />
      <CreativeRecipeForm standalone />
    </>
  );
}
