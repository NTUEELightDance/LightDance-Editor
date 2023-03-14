import { useQuery, useReactiveVar } from "@apollo/client";

// gql
import { GET_POS_MAP, GET_POS_RECORD } from "../graphql";
import { reactiveState } from "@/core/state";
import { PosRecord } from "@/core/models";

export default function usePos() {
  // query posMap
  const { loading: posMapLoading, error: posMapError } = useQuery(GET_POS_MAP);

  // query posRecord
  const {
    loading: posRecordLoading,
    error: posRecordError,
    data: posRecordData,
  } = useQuery(GET_POS_RECORD);
  const posRecord = posRecordData?.positionFrameIDs as PosRecord;

  const posMap = useReactiveVar(reactiveState.posMap);

  return {
    loading: posMapLoading || posRecordLoading,
    error: posMapError != null || posRecordError,
    posMap,
    posRecord,
  };
}
