import { useQuery, useReactiveVar } from "@apollo/client";

// gql
import { GET_CONTROL_RECORD } from "../graphql";
import { reactiveState } from "@/core/state";
import { ControlRecord } from "@/core/models";

export default function useControl() {
  // query controlRecord
  const {
    loading: controlRecordLoading,
    error: controlRecordError,
    data: controlRecordData,
  } = useQuery(GET_CONTROL_RECORD);
  const controlRecord = controlRecordData?.controlFrameIDs as ControlRecord;

  const controlMap = useReactiveVar(reactiveState.controlMap);

  return {
    loading: controlRecordLoading,
    error: controlRecordError,
    controlMap,
    controlRecord,
  };
}
