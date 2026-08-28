import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
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
    select: (items) => items.map((item) => item.replaceAll("_", " ")),
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
