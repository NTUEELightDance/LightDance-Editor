import client from "../client";
import lodash from "lodash";

// gql
import {
  GET_CONTROL_MAP,
  GET_CONTROL_RECORD,
  ADD_OR_EDIT_CONTROL_FRAME,
  EDIT_CONTROL_RECORD_BY_ID,
  DELETE_CONTROL_FRAME_BY_ID,
  REQUEST_EDIT_CONTROL_BY_ID,
  CANCEL_EDIT_CONTROL_BY_ID,
} from "../graphql";

// types
import { ControlMapStatus, DancerCoordinates } from "../core/models";

/**
 * controlAgent: reponsible for controlMap and controlRecord
 */
export const controlAgent = {
  getControlMap: async () => {
    const controlMapData = await client.query({ query: GET_CONTROL_MAP });
    return controlMapData.data.ControlMap.frames;
  },
  getControlRecord: async () => {
    const controlRecordData = await client.query({ query: GET_CONTROL_RECORD });
    return controlRecordData.data.controlFrameIDs;
  },
  addFrame: async (
    frame: DancerCoordinates | ControlMapStatus,
    currentTime: number,
    frameIndex: number,
    fade?: boolean
  ) => {
    try {
      await client.mutate({
        mutation: ADD_OR_EDIT_CONTROL_FRAME,
        variables: {
          start: currentTime,
          fade: fade,
          controlData: Object.keys(frame).map((key) => {
            return {
              dancerName: key,
              controlData: Object.keys(frame[key]).map((k) => {
                if (typeof (frame as ControlMapStatus)[key][k] === "number")
                  return {
                    partName: k,
                    ELValue: (frame as ControlMapStatus)[key][k],
                  };
                return {
                  partName: k,
                  ...((frame as ControlMapStatus)[key][k] as Object),
                };
              }),
            };
          }),
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
    const controlMap = await controlAgent.getControlMap();
    const frameTime = controlMap[frameId].start;
    try {
      await client.mutate({
        mutation: ADD_OR_EDIT_CONTROL_FRAME,
        variables: {
          start: frameTime,
          fade: fade,
          controlData: Object.keys(frame).map((dancerName) => {
            return {
              dancerName: dancerName,
              controlData: Object.keys(frame[dancerName]).map((partName) => {
                if (
                  typeof (frame as ControlMapStatus)[dancerName][partName] ===
                  "number"
                )
                  return {
                    partName,
                    ELValue: (frame as ControlMapStatus)[dancerName][partName],
                  };
                return {
                  partName,
                  ...(frame as ControlMapStatus)[dancerName][partName] as Object,
                };
              }),
            };
          }),
        },
      });
    } catch (error) {
      console.error(error);
    }
    if (!requestTimeChange) return;
    try {
      await client.mutate({
        mutation: EDIT_CONTROL_RECORD_BY_ID,
        variables: {
          input: {
            frameID: frameId,
            start: currentTime,
            fade: fade,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
  deleteFrame: async (frameId: String) => {
    try {
      await client.mutate({
        mutation: DELETE_CONTROL_FRAME_BY_ID,
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
  requestEditPermission: async (_frameID) => {
    const response = await client.mutate({
      mutation: REQUEST_EDIT_CONTROL_BY_ID,
      variables: {
        frameId: _frameID,
      },
    });
    return response.data.RequestEditControl.ok;
  },
  cancelEditPermission: async (_frameID) => {
    const response = await client.mutate({
      mutation: CANCEL_EDIT_CONTROL_BY_ID,
      variables: {
        frameId: _frameID,
      },
    });
    return response.data.CancelEditControl.ok;
  },
};
