import { useIngredientOptions } from "../hooks/useKitchenQueries";
import { humanName, normaliseIngredient } from "../utils/format";
import { Autocomplete } from "./Autocomplete";

export function IngredientAutocomplete(props) {
  const options = useIngredientOptions();
  return (
    <Autocomplete
      {...props}
      options={options.data || []}
      getOptionLabel={humanName}
      getOptionValue={normaliseIngredient}
      exclude={(props.exclude || []).map(normaliseIngredient)}
      placeholder={props.placeholder || "Search for an ingredient"}
    />
  );
}
