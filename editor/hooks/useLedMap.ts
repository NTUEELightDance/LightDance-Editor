import { useQuery } from "@apollo/client";
// types
import { LedMap } from "core/models";

// gql
import { GET_LED_MAP } from "../graphql";

export default function useLedMap() {
  // query controlMap
  const {
    loading: ledMapLoading,
    error: ledMapError,
    data: ledMapData,
  } = useQuery(GET_LED_MAP);
  const ledMap: LedMap = ledMapData?.LEDMap?.LEDMap;

  return {
    loading: ledMapLoading,
    error: ledMapError,
    ledMap: ledMap,
  };
}
