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
  ControlMapQueryPayload,
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

    return controlMapData.ControlMap.frameIds as ControlMapQueryPayload;
  },

  getControlRecord: async () => {
    const { data: controlRecordData } = await client.query({
      query: GET_CONTROL_RECORD,
    });

    return controlRecordData.controlFrameIDs as ControlRecord;
  },

  addFrame: async (addFrameInput: {
    start: number;
    frame: ControlMapStatus | PosMapStatus;
    fade?: boolean;
  }) => {
    if (!isControlMapStatus(addFrameInput.frame)) {
      return;
    }

    try {
      const { data: response } = await client.mutate<
        AddControlFrameMutationResponseData,
        AddControlFrameMutationVariables
      >({
        mutation: ADD_CONTROL_FRAME,
        variables: {
          start: addFrameInput.start,
          controlData: toControlMapStatusMutationPayload(addFrameInput.frame),
          ...(addFrameInput.fade && { fade: addFrameInput.fade }),
        },
      });

      return response?.addControlFrame;
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

    const promises: Promise<unknown>[] = [
      client.mutate({
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
      }),
    ];

    if (saveFrameInput.requestTimeChange) {
      promises.push(
        client.mutate<
          EditControlFrameTimeMutationResponseData,
          EditControlFrameTimeMutationVariables
        >({
          mutation: EDIT_CONTROL_FRAME_TIME,
          variables: {
            input: {
              frameID: saveFrameInput.frameId,
              start: saveFrameInput.start,
            },
          },
        })
      );
    }

    try {
      await Promise.all(promises);
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
