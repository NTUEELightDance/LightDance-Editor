import client from "@/client";

import {
  GET_POS_MAP,
  GET_POS_RECORD,
  EDIT_POS_FRAME,
  EDIT_POS_FRAME_TIME,
  DELETE_POS_FRAME,
  REQUEST_EDIT_POS_BY_ID,
  CANCEL_EDIT_POS_BY_ID,
  ADD_POS_FRAME,
} from "@/graphql";

import type {
  ControlMapStatus,
  PosMapPayload,
  PosMapStatus,
  PosRecord,
} from "@/core/models";
import { isPosMapStatus } from "@/core/models";

import { toPosMapStatusPayload } from "@/core/utils/convert";

/**
 * posAgent: responsible for posMap and posRecord
 */
export const posAgent = {
  getPosMapPayload: async () => {
    const { data: posMapData } = await client.query({ query: GET_POS_MAP });

    return posMapData.PosMap.frameIds as PosMapPayload;
  },

  getPosRecord: async () => {
    const { data: posRecordData } = await client.query({
      query: GET_POS_RECORD,
    });

    return posRecordData.positionFrameIDs as PosRecord;
  },

  addFrame: async (
    frame: PosMapStatus | ControlMapStatus,
    currentTime: number
  ) => {
    if (!isPosMapStatus(frame)) {
      return;
    }

    try {
      await client.mutate({
        mutation: ADD_POS_FRAME,
        variables: {
          start: currentTime,
        },
        refetchQueries: [
          {
            query: GET_POS_RECORD,
          },
        ],
      });

      await client.mutate({
        mutation: EDIT_POS_FRAME,
        variables: {
          start: currentTime,
          pos: toPosMapStatusPayload(frame),
        },
        refetchQueries: [
          {
            query: GET_POS_MAP,
          },
        ],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  saveFrame: async (
    frameId: string,
    frame: PosMapStatus | ControlMapStatus,
    currentTime: number,
    requestTimeChange: boolean
  ) => {
    if (!isPosMapStatus(frame)) {
      return;
    }

    if (requestTimeChange) {
      try {
        await client.mutate({
          mutation: EDIT_POS_FRAME_TIME,
          variables: {
            input: {
              frameID: parseInt(frameId),
              start: currentTime,
            },
          },
          refetchQueries: [
            {
              query: GET_POS_RECORD,
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
        mutation: EDIT_POS_FRAME,
        variables: {
          start: currentTime,
          pos: toPosMapStatusPayload(frame),
        },
        refetchQueries: [
          {
            query: GET_POS_MAP,
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
        mutation: DELETE_POS_FRAME,
        variables: {
          input: {
            frameID: parseInt(frameId),
          },
        },
        refetchQueries: [
          {
            query: GET_POS_RECORD,
          },
          {
            query: GET_POS_MAP,
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
      mutation: REQUEST_EDIT_POS_BY_ID,
      variables: {
        frameId: parseInt(frameId),
      },
    });

    return response.RequestEditPosition.ok;
  },

  cancelEditPermission: async (frameId: string) => {
    const { data: response } = await client.mutate({
      mutation: CANCEL_EDIT_POS_BY_ID,
      variables: {
        frameId: parseInt(frameId),
      },
    });

    return response.CancelEditPosition.ok;
  },
};
