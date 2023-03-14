import { useQuery, useReactiveVar } from "@apollo/client";

import { GET_LED_MAP } from "../graphql";
import { reactiveState } from "@/core/state";

export default function useLedMap() {
  const { loading: ledMapLoading, error: ledMapError } = useQuery(GET_LED_MAP);

  const ledMap = useReactiveVar(reactiveState.ledMap);

  return {
    loading: ledMapLoading,
    error: ledMapError,
    ledMap,
  };
}
