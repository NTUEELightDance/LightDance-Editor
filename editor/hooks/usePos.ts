import { useQuery, useReactiveVar } from "@apollo/client";

// gql
import { GET_POS_MAP, GET_POS_RECORD } from "../graphql";
import { reactiveState } from "@/core/state";

export default function usePos() {
  // query posMap
  const { loading: posMapLoading, error: posMapError } = useQuery(GET_POS_MAP);
  const posMap = useReactiveVar(reactiveState.posMap);

  // query posRecord
  const {
    loading: posRecordLoading,
    error: posRecordError,
    data: posRecordData,
  } = useQuery(GET_POS_RECORD);
  const posRecord = posRecordData?.positionFrameIDs;

  return {
    loading: posMapLoading || posRecordLoading,
    error: posMapError != null || posRecordError,
    posMap,
    posRecord,
  };
}
