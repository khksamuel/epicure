import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { epicureApi } from "../api/client";

export function useIngredientExploration(ingredient) {
  const enabled = Boolean(ingredient);
  const pairings = useQuery({
    queryKey: ["pairings", ingredient],
    queryFn: () => epicureApi.compareNeighbors(ingredient),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
  const modes = useQuery({
    queryKey: ["modes", ingredient],
    queryFn: () => epicureApi.modes(ingredient),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
  return { pairings, modes };
}

export function useDirections() {
  return useQuery({
    queryKey: ["directions"],
    queryFn: epicureApi.directions,
    staleTime: 60 * 60 * 1000,
    placeholderData: ["cuisine:South_Asian"],
  });
}

export function useIngredientOptions() {
  return useQuery({
    queryKey: ["ingredient-options"],
    queryFn: epicureApi.ingredients,
    staleTime: 60 * 60 * 1000,
  });
}

export function useRandomFlavourNote() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["random-flavour-note"],
    queryFn: async () => {
      const ingredients = await queryClient.fetchQuery({
        queryKey: ["ingredient-options"],
        queryFn: epicureApi.ingredients,
        staleTime: 60 * 60 * 1000,
      });
      if (!ingredients.length) throw new Error("No ingredients are available.");

      const ingredient = ingredients[Math.floor(Math.random() * ingredients.length)];
      const pairings = await epicureApi.neighbors(ingredient, 2);
      if (pairings.length < 2) throw new Error("Not enough pairing ideas are available.");

      return { ingredient, pairings };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSlerp() {
  return useMutation({ mutationFn: epicureApi.slerp });
}

export function useRecipeIdeas() {
  return useMutation({ mutationFn: epicureApi.recipeIdeas });
}

export function usePairingSearch() {
  return useMutation({ mutationFn: epicureApi.compareNeighbors });
}

export function useIngredientComparison(leftIngredient, rightIngredient) {
  const [left, right] = useQueries({
    queries: [leftIngredient, rightIngredient].map((ingredient) => ({
      queryKey: ["pairings", ingredient],
      queryFn: () => epicureApi.compareNeighbors(ingredient),
      enabled: Boolean(ingredient),
      staleTime: 5 * 60 * 1000,
    })),
  });
  return { left, right };
}
