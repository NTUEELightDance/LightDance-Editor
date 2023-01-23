import { useQuery } from "@apollo/client";

// gql
import { GET_CONTROL_MAP, GET_CONTROL_RECORD } from "../graphql";

export default function useControl() {
  // query controlMap
  const {
    loading: controlMapLoading,
    error: controlMapError,
    data: controlMapData,
  } = useQuery(GET_CONTROL_MAP);
  const controlMap = controlMapData?.ControlMap?.frames;

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
    controlMap,
    controlRecord,
  };
}
