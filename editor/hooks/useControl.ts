import { useQuery } from "@apollo/client";

// gql
import { GET_CONTROL_MAP, GET_CONTROL_RECORD } from "../graphql";
import { state } from "@/core/state";

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

  return {
    loading: controlMapLoading || controlRecordLoading,
    error: controlMapError != null || controlRecordError,
    controlMap: state.controlMap,
    controlRecord,
  };
}
