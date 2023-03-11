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

  addFrame: async (addFrameInput: {
    start: number;
    frame: PosMapStatus | ControlMapStatus;
  }) => {
    if (!isPosMapStatus(addFrameInput.frame)) {
      return;
    }

    try {
      const { data: response } = await client.mutate({
        mutation: ADD_POS_FRAME,
        variables: {
          start: addFrameInput.start,
          positionData: toPosMapStatusPayload(addFrameInput.frame),
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

      return response?.addPositionFrame?.id as number;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  saveFrame: async (saveFrameInput: {
    frameId: number;
    frame: PosMapStatus | ControlMapStatus;
    start: number;
    requestTimeChange: boolean;
  }) => {
    if (!isPosMapStatus(saveFrameInput.frame)) {
      return;
    }

    if (saveFrameInput.requestTimeChange) {
      try {
        await client.mutate({
          mutation: EDIT_POS_FRAME_TIME,
          variables: {
            input: {
              frameID: saveFrameInput.frameId,
              start: saveFrameInput.start,
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
      await client.mutate({
        mutation: EDIT_POS_FRAME,
        variables: {
          input: {
            frameId: saveFrameInput.frameId,
            positionData: toPosMapStatusPayload(saveFrameInput.frame),
          },
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

  deleteFrame: async (frameId: number) => {
    try {
      client.mutate({
        mutation: DELETE_POS_FRAME,
        variables: {
          input: {
            frameID: frameId,
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

  requestEditPermission: async (frameId: number) => {
    const { data: response } = await client.mutate({
      mutation: REQUEST_EDIT_POS_BY_ID,
      variables: {
        frameId: frameId,
      },
    });

    return response.RequestEditPosition.ok;
  },

  cancelEditPermission: async (frameId: number) => {
    const { data: response } = await client.mutate({
      mutation: CANCEL_EDIT_POS_BY_ID,
      variables: {
        frameId: frameId,
      },
    });

    return response.CancelEditPosition.ok;
  },
};
