import { useQuery } from "@apollo/client";

// gql
import { GET_POS_MAP, GET_POS_RECORD } from "../graphql";

export default function usePos() {
  // query posMap
  const {
    loading: posMapLoading,
    error: posMapError,
    data: posMapData,
  } = useQuery(GET_POS_MAP);
  const posMap = posMapData?.PosMap?.frames;

  // query posRecord
  const {
    loading: posRecordLoading,
    error: posRecordError,
    data: posRecordData,
  } = useQuery(GET_POS_RECORD);
  const posRecord = posRecordData?.positionFrameIDs;

  return {
    loading: posMapLoading || posRecordLoading,
    error: posMapError || posRecordError,
    posMap,
    posRecord,
  };
}
