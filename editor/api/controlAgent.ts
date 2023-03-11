import client from "@/client";

import {
  GET_CONTROL_MAP,
  GET_CONTROL_RECORD,
  EDIT_CONTROL_FRAME,
  EDIT_CONTROL_FRAME_TIME,
  DELETE_CONTROL_FRAME_BY_ID,
  REQUEST_EDIT_CONTROL_BY_ID,
  CANCEL_EDIT_CONTROL_BY_ID,
  ADD_CONTROL_FRAME,
  AddControlFrameMutationResponseData,
  AddControlFrameMutationVariables,
  EditControlFrameTimeMutationResponseData,
  EditControlFrameTimeMutationVariables,
} from "@/graphql";

import type {
  ControlMapStatus,
  PosMapStatus,
  ControlRecord,
} from "@/core/models";
import { isControlMapStatus } from "@/core/models";

import { toControlMapStatusMutationPayload } from "@/core/utils/convert";

/**
 * controlAgent: responsible for controlMap and controlRecord
 */
export const controlAgent = {
  getControlMapPayload: async () => {
    const { data: controlMapData } = await client.query({
      query: GET_CONTROL_MAP,
    });

    return controlMapData.ControlMap.frameIds;
  },

  getControlRecord: async () => {
    const { data: controlRecordData } = await client.query({
      query: GET_CONTROL_RECORD,
    });

    return controlRecordData.controlFrameIDs as ControlRecord;
  },

  // create a new empty frame
  addFrame: async (addFrameInput: {
    start: number;
    fade?: boolean;
    controlData?: ControlMapStatus;
  }) => {
    try {
      const { data: response } = await client.mutate<
        AddControlFrameMutationResponseData,
        AddControlFrameMutationVariables
      >({
        mutation: ADD_CONTROL_FRAME,
        variables: {
          start: addFrameInput.start,
          ...(addFrameInput.fade && { fade: addFrameInput.fade }),
          ...(addFrameInput.controlData && {
            controlData: toControlMapStatusMutationPayload(
              addFrameInput.controlData
            ),
          }),
        },
        refetchQueries: [
          {
            query: GET_CONTROL_RECORD,
          },
          {
            query: GET_CONTROL_MAP,
          },
        ],
      });

      return response?.addControlFrame?.id as number;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  saveFrame: async (saveFrameInput: {
    frameId: number;
    frame: ControlMapStatus | PosMapStatus;
    start: number;
    requestTimeChange: boolean;
    fade?: boolean;
  }) => {
    if (!isControlMapStatus(saveFrameInput.frame)) {
      return;
    }

    if (saveFrameInput.requestTimeChange) {
      try {
        await client.mutate<
          EditControlFrameTimeMutationResponseData,
          EditControlFrameTimeMutationVariables
        >({
          mutation: EDIT_CONTROL_FRAME_TIME,
          variables: {
            input: {
              frameId: saveFrameInput.frameId,
              start: saveFrameInput.start,
            },
          },
          refetchQueries: [
            {
              query: GET_CONTROL_RECORD,
            },
          ],
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    try {
      await client.mutate({
        mutation: EDIT_CONTROL_FRAME,
        variables: {
          input: {
            frameId: saveFrameInput.frameId,
            controlData: toControlMapStatusMutationPayload(
              saveFrameInput.frame
            ),
            fade: saveFrameInput.fade,
          },
        },
        refetchQueries: [
          {
            query: GET_CONTROL_MAP,
          },
        ],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteFrame: async (frameId: number) => {
    try {
      client.mutate({
        mutation: DELETE_CONTROL_FRAME_BY_ID,
        variables: {
          input: {
            frameID: frameId,
          },
        },
        refetchQueries: [
          {
            query: GET_CONTROL_RECORD,
          },
          {
            query: GET_CONTROL_MAP,
          },
        ],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  requestEditPermission: async (frameId: number) => {
    const { data: response } = await client.mutate({
      mutation: REQUEST_EDIT_CONTROL_BY_ID,
      variables: {
        frameId: frameId,
      },
    });

    return response.RequestEditControl.ok;
  },

  cancelEditPermission: async (frameId: number) => {
    const { data: response } = await client.mutate({
      mutation: CANCEL_EDIT_CONTROL_BY_ID,
      variables: {
        frameId: frameId,
      },
    });

    return response.CancelEditControl.ok;
  },
};
