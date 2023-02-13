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
  SELECT_CONTROL_FRAMES,
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

  selectControlFrames: async (frameIds: number[]) => {
    const { data: controlFramesData } = await client.query({
      query: SELECT_CONTROL_FRAMES,
      variables: {
        select: {
          frameIds,
        },
      },
    });

    return controlFramesData.ControlMap.frameIds as ControlMapQueryPayload;
  },

  getControlRecord: async () => {
    const { data: controlRecordData } = await client.query({
      query: GET_CONTROL_RECORD,
    });
    return controlRecordData.controlFrameIDs as ControlRecord;
  },

  // create a new empty frame
  addFrame: async (currentTime: number, fade?: boolean) => {
    try {
      const { data: response } = await client.mutate({
        mutation: ADD_CONTROL_FRAME,
        variables: {
          start: currentTime,
          ...(fade !== undefined && { fade }),
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

      return response.addControlFrame.id.toString() as string;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  saveFrame: async (
    frameId: string,
    frame: ControlMapStatus | PosMapStatus,
    currentTime: number,
    requestTimeChange: boolean,
    fade?: boolean
  ) => {
    if (!isControlMapStatus(frame)) {
      return;
    }

    if (requestTimeChange) {
      try {
        await client.mutate({
          mutation: EDIT_CONTROL_FRAME_TIME,
          variables: {
            input: {
              frameID: parseInt(frameId),
              start: currentTime,
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
      client.mutate({
        mutation: EDIT_CONTROL_FRAME,
        variables: {
          input: {
            frameId: parseInt(frameId),
            controlData: toControlMapStatusMutationPayload(frame),
            ...(fade !== undefined && { fade }),
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

  deleteFrame: async (frameId: string) => {
    try {
      client.mutate({
        mutation: DELETE_CONTROL_FRAME_BY_ID,
        variables: {
          input: {
            frameID: parseInt(frameId),
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

  requestEditPermission: async (frameId: string) => {
    const { data: response } = await client.mutate({
      mutation: REQUEST_EDIT_CONTROL_BY_ID,
      variables: {
        frameId: parseInt(frameId),
      },
    });

    return response.RequestEditControl.ok;
  },

  cancelEditPermission: async (frameId: string) => {
    const { data: response } = await client.mutate({
      mutation: CANCEL_EDIT_CONTROL_BY_ID,
      variables: {
        frameId: parseInt(frameId),
      },
    });

    return response.CancelEditControl.ok;
  },
};
