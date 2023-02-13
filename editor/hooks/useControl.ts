import { useQuery, useReactiveVar } from "@apollo/client";

// gql
import { GET_CONTROL_MAP, GET_CONTROL_RECORD } from "../graphql";
import { reactiveState } from "@/core/state";

export default function useControl() {
  // query controlMap
  const { loading: controlMapLoading, error: controlMapError } =
    useQuery(GET_CONTROL_MAP);

  // query controlRecord
  const {
    loading: controlRecordLoading,
    error: controlRecordError,
    data: controlRecordData,
  } = useQuery(GET_CONTROL_RECORD);
  const controlRecord = controlRecordData?.controlFrameIDs;

  const controlMap = useReactiveVar(reactiveState.controlMap);

  return {
    loading: controlMapLoading || controlRecordLoading,
    error: controlMapError != null || controlRecordError,
    controlMap,
    controlRecord,
  };
}
