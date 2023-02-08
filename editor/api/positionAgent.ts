import client from "../client";
import lodash from "lodash";

// gql
import {
  GET_POS_MAP,
  GET_POS_RECORD,
  ADD_OR_EDIT_POS_FRAME,
  EDIT_POS_FRAME_TIME,
  DELETE_POS_FRAME,
  REQUEST_EDIT_POS_BY_ID,
  CANCEL_EDIT_POS_BY_ID,
} from "@/graphql";

// types
import type {
  ControlMapStatus,
  PosMapPayload,
  PosMapStatus,
  PosRecord,
} from "@/core/models";

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
    try {
      await client.mutate({
        mutation: ADD_OR_EDIT_POS_FRAME,
        variables: {
          start: currentTime,
          positionData: Object.keys(frame).map((key) => {
            return {
              dancerName: key,
              positionData: JSON.parse(JSON.stringify(frame[key])),
            };
          }),
        },
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
    requestTimeChange: boolean,
    fade?: boolean
  ) => {
    const posMap = await posAgent.getPosMapPayload();
    const frameTime = posMap[frameId].start;
    try {
      client.cache.modify({
        id: "ROOT_QUERY",
        fields: {
          PosMap(posMap) {
            return {
              frames: {
                ...posMap.frames,
                [frameId]: {
                  start: requestTimeChange ? currentTime : frameTime,
                  fade,
                  pos: frame,
                },
              },
            };
          },
        },
      });
      // don't use await for optimisticResponse
      client.mutate({
        mutation: ADD_OR_EDIT_POS_FRAME,
        variables: {
          start: frameTime,
          positionData: Object.keys(frame).map((key) => {
            return {
              dancerName: key,
              positionData: JSON.parse(JSON.stringify(frame[key])),
            };
          }),
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
    if (!requestTimeChange) return;
    try {
      client.mutate({
        mutation: EDIT_POS_FRAME_TIME,
        variables: {
          input: {
            frameID: frameId,
            start: currentTime,
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  deleteFrame: async (frameId: string) => {
    try {
      client.cache.modify({
        id: "ROOT_QUERY",
        fields: {
          positionFrameIDs(positionFrameIDs) {
            return positionFrameIDs.filter((id: string) => id !== frameId);
          },
          PosMap(posMap) {
            return {
              ...posMap,
              frames: lodash.omit(posMap.frames, [frameId]),
            };
          },
        },
      });
      // don't use await for optimisticResponse
      client.mutate({
        mutation: DELETE_POS_FRAME,
        variables: {
          input: {
            frameID: frameId,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
  requestEditPermission: async (_frameID: string) => {
    const response = await client.mutate({
      mutation: REQUEST_EDIT_POS_BY_ID,
      variables: {
        frameId: _frameID,
      },
    });
    return response.data.RequestEditPosition.ok;
  },
  cancelEditPermission: async (_frameID: string) => {
    const response = await client.mutate({
      mutation: CANCEL_EDIT_POS_BY_ID,
      variables: {
        frameId: _frameID,
      },
    });
    return response.data.CancelEditPosition.ok;
  },
};
