import store from "../store";
import client from "../client";
import lodash from "lodash";

// gql
import {
  GET_CONTROL_MAP,
  GET_CONTROL_RECORD,
  GET_POS_MAP,
  GET_POS_RECORD,
  ADD_OR_EDIT_CONTROL_FRAME,
  ADD_OR_EDIT_POS_FRAME,
  EDIT_CONTROL_RECORD_BY_ID,
  EDIT_POS_FRAME_TIME,
  DELETE_CONTROL_FRAME_BY_ID,
  DELETE_POS_FRAME,
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
        update: (cache, { data: { editControlMap } }) => {
          cache.modify({
            id: "ROOT_QUERY",
            fields: {
              controlFrameIDs(controlFrameIDs) {
                return [
                  ...controlFrameIDs.slice(0, frameIndex + 1),
                  Object.keys(editControlMap.frame)[0],
                  ...controlFrameIDs.slice(frameIndex + 1),
                ];
              },
              ControlMap(controlMap) {
                return {
                  ...controlMap,
                  frames: {
                    ...controlMap.frames,
                    [Object.keys(editControlMap.frame)[0]]: {
                      ...editControlMap.frame[
                        Object.keys(editControlMap.frame)[0]
                      ],
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
    const controlMap = await controlAgent.getControlMap();
    const frameTime = controlMap[frameId].start;
    try {
      await client.mutate({
        mutation: ADD_OR_EDIT_CONTROL_FRAME,
        variables: {
          start: frameTime,
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
        update: (cache, { data: { editControlMap } }) => {
          cache.modify({
            id: "ROOT_QUERY",
            fields: {
              ControlMap(controlMap) {
                return {
                  ...controlMap,
                  frames: {
                    ...controlMap.frames,
                    [Object.keys(editControlMap.frame)[0]]: {
                      ...editControlMap.frame[
                        Object.keys(editControlMap.frame)[0]
                      ],
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
        mutation: EDIT_CONTROL_RECORD_BY_ID,
        variables: {
          input: {
            frameID: frameId,
            start: currentTime,
            fade: fade,
          },
        },
        update: (cache, { data: { editControlFrame } }) => {
          cache.modify({
            id: "ROOT_QUERY",
            fields: {
              ControlMap(controlMap) {
                return {
                  ...controlMap,
                  frames: {
                    ...controlMap.frames,
                    [editControlFrame.id]: {
                      ...controlMap.frames[editControlFrame.id],
                      start: editControlFrame.start,
                      fade: editControlFrame.fade,
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
        mutation: DELETE_CONTROL_FRAME_BY_ID,
        variables: {
          input: {
            frameID: frameId,
          },
        },
        update: (cache, { data: { deleteControlFrame } }) => {
          cache.modify({
            id: "ROOT_QUERY",
            fields: {
              controlFrameIDs(controlFrameIDs) {
                return controlFrameIDs.filter(
                  (e: String) => e !== deleteControlFrame.id
                );
              },
              ControlMap(controlMap) {
                return {
                  ...controlMap,
                  frames: lodash.omit(controlMap.frames, deleteControlFrame.id),
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
};

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
};

export const uploadJson = (file, type) => {
  const formData = new FormData();

  formData.append(type, file);
  if (type === "position" && type === "control") {
    fetch(`/api/editor/upload/${type}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

export const uploadImages = (files, path, imagePrefix) => {
  const formData = new FormData();
  files.forEach((file, i) => {
    formData.append(`image${i}`, file);
  });

  formData.append("filePath", path);
  formData.append("imagePrefix", imagePrefix);

  fetch("/api/editor/upload/images", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const requestDownload = (control, position, texture) => {
  const payload = JSON.stringify({ control, position, texture });

  fetch("/api/editor/download", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const fetchTexture = () => {
  const texturePath = store.getState().load.load.Texture;
  return fetch(texturePath, {
    method: "GET",
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
};
