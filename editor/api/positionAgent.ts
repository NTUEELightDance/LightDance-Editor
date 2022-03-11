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
  CANCEL_EDIT_POS_BY_ID,
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
              positionData: JSON.parse(JSON.stringify(frame[key])),
            };
          }),
        },
        update: (cache, { data: { editPosMap } }) => {
          cache.modify({
            id: "ROOT_QUERY",
            fields: {
              positionFrameIDs(positionFrameIDs) {
                return [
                  ...positionFrameIDs.slice(0, frameIndex + 1),
                  Object.keys(editPosMap.frames)[0],
                  ...positionFrameIDs.slice(frameIndex + 1),
                ];
              },
              PosMap(posMap) {
                return {
                  ...posMap,
                  frames: {
                    ...posMap.frames,
                    [Object.keys(editPosMap.frames)[0]]: {
                      ...editPosMap.frames[Object.keys(editPosMap.frames)[0]],
                    },
                  },
                };
              },
            },
          });
        },
      });
    } catch (error) {
      console.error(error);
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
      await client.mutate({
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
        update: (cache, { data: { editPosMap } }) => {
          cache.modify({
            id: "ROOT_QUERY",
            fields: {
              PosMap(posMap) {
                return {
                  ...posMap,
                  frames: {
                    ...posMap.frames,
                    [Object.keys(editPosMap.frames)[0]]: {
                      ...editPosMap.frames[Object.keys(editPosMap.frames)[0]],
                    },
                  },
                };
              },
            },
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
    if (!requestTimeChange) return;
    try {
      await client.mutate({
        mutation: EDIT_POS_FRAME_TIME,
        variables: {
          input: {
            frameID: frameId,
            start: currentTime,
          },
        },
        update: (cache, { data: { editPositionFrame } }) => {
          cache.modify({
            id: "ROOT_QUERY",
            fields: {
              PosMap(posMap) {
                return {
                  ...posMap,
                  frames: {
                    ...posMap.frames,
                    [editPositionFrame.id]: {
                      ...posMap.frames[editPositionFrame.id],
                      start: editPositionFrame.start,
                    },
                  },
                };
              },
            },
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
  deleteFrame: async (frameId: String) => {
    try {
      await client.mutate({
        mutation: DELETE_POS_FRAME,
        variables: {
          input: {
            frameID: frameId,
          },
        },
        update: (cache, { data: { deletePositionFrame } }) => {
          cache.modify({
            id: "ROOT_QUERY",
            fields: {
              positionFrameIDs(positionFrameIDs) {
                return positionFrameIDs.filter(
                  (e: String) => e !== deletePositionFrame.id
                );
              },
              PosMap(posMap) {
                return {
                  ...posMap,
                  frames: lodash.omit(posMap.frames, deletePositionFrame.id),
                };
              },
            },
          });
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
  requestEditPermission: async (_frameID) => {
    const response = await client.mutate({
      mutation: REQUEST_EDIT_POS_BY_ID,
      variables: {
        frameId: _frameID,
      },
    });
    return response.data.RequestEditPosition.ok;
  },
  cancelEditPermission: async (_frameID) => {
    const response = await client.mutate({
      mutation: CANCEL_EDIT_POS_BY_ID,
      variables: {
        frameId: _frameID,
      },
    });
    return response.data.CancelEditPosition.ok;
  },
};
