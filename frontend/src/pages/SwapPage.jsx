import { IngredientSwap } from "../components/IngredientSwap";
import { PageIntro } from "../components/PageIntro";

export function SwapPage() {
  return (
    <>
      <PageIntro
        title="Swap an ingredient."
        description="Explore nearby ingredients when something is unavailable, unsuitable, or simply too expected."
        note="A flavour neighbour is a creative lead, not always a functional substitute."
      />
      <IngredientSwap />
    </>
  );
}
