import store from "../store";
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
  CANCEL_EDIT_POS_BY_ID
} from "../graphql";

// types
import { ControlMapStatus, DancerCoordinates } from "../core/models";

/**
 * posAgent: responsible for posMap and posRecord
 */
export const posAgent = {
  getPosMap: async () => {
    const posMapData = await client.query({ query: GET_POS_MAP });
    return posMapData.data.PosMap.frames;
  },
  getPosRecord: async () => {
    const posRecordData = await client.query({ query: GET_POS_RECORD });
    return posRecordData.data.positionFrameIDs;
  },
  addFrame: async (
    frame: DancerCoordinates | ControlMapStatus,
    currentTime: number,
    frameIndex: number,
    fade?: boolean
  ) => {
    try {
      await client.mutate({
        mutation: ADD_OR_EDIT_POS_FRAME,
        variables: {
          start: currentTime,
          positionData: Object.keys(frame).map((key) => {
            return {
              dancerName: key,
              positionData: JSON.parse(JSON.stringify(frame[key]))
            };
          })
        }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  saveFrame: async (
    frameId: string,
    frame: DancerCoordinates | ControlMapStatus,
    currentTime: number,
    requestTimeChange: boolean,
    fade?: boolean
  ) => {
    const posMap = await posAgent.getPosMap();
    const frameTime = posMap[frameId].start;
    try {
      client.cache.modify({
        id: "ROOT_QUERY",
        fields: {
          PosMap (posMap) {
            return {
              frames: {
                ...posMap.frames,
                [frameId]: {
                  start: requestTimeChange ? currentTime : frameTime,
                  fade,
                  pos: frame
                }
              }
            };
          }
        }
      });
      // don't use await for optimisticResponse
      client.mutate({
        mutation: ADD_OR_EDIT_POS_FRAME,
        variables: {
          start: frameTime,
          positionData: Object.keys(frame).map((key) => {
            return {
              dancerName: key,
              positionData: JSON.parse(JSON.stringify(frame[key]))
            };
          })
        }
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
            start: currentTime
          }
        }
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
          positionFrameIDs (positionFrameIDs) {
            return positionFrameIDs.filter((id: string) => id !== frameId);
          },
          PosMap (posMap) {
            return {
              ...posMap,
              frames: lodash.omit(posMap.frames, [frameId])
            };
          }
        }
      });
      // don't use await for optimisticResponse
      client.mutate({
        mutation: DELETE_POS_FRAME,
        variables: {
          input: {
            frameID: frameId
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  },
  requestEditPermission: async (_frameID: string) => {
    const response = await client.mutate({
      mutation: REQUEST_EDIT_POS_BY_ID,
      variables: {
        frameId: _frameID
      }
    });
    return response.data.RequestEditPosition.ok;
  },
  cancelEditPermission: async (_frameID: string) => {
    const response = await client.mutate({
      mutation: CANCEL_EDIT_POS_BY_ID,
      variables: {
        frameId: _frameID
      }
    });
    return response.data.CancelEditPosition.ok;
  }
};
