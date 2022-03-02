import {
  SUB_POS_RECORD,
  SUB_POS_MAP,
  SUB_CONTROL_RECORD,
  SUB_CONTROL_MAP,
} from "../graphql";
import lodash from "lodash";
import { produce } from "immer";

const subPosRecord = (client, userID: string) => {
  client
    .subscribe({
      query: SUB_POS_RECORD,
    })
    .subscribe({
      next(data) {
        const { editBy, mutation, index, frameID } =
          data.data.positionRecordSubscription;
        if (userID !== editBy) {
          client.cache.modify({
            id: "ROOT_QUERY",
            fields: {
              positionFrameIDs(positionFrameIDs: Array<string>) {
                if (mutation === "CREATED") {
                  return [
                    ...positionFrameIDs.slice(0, index),
                    frameID,
                    ...positionFrameIDs.slice(index),
                  ];
                } else if (mutation === "DELETED") {
                  return positionFrameIDs.filter((e: string) => {
                    return e !== frameID;
                  });
                }
              },
            },
          });
        }
      },
      error(err) {
        console.error("SubscriptionError", err);
      },
    });
};

const subPosMap = (client, userID: string) => {
  client
    .subscribe({
      query: SUB_POS_MAP,
    })
    .subscribe({
      next(data) {
        const { mutation, frameID, frame } = data.data.positionMapSubscription;
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            PosMap(posMap) {
              // old format
              if (mutation === ("CREATED" || "UPDATED")) {
                return {
                  ...posMap,
                  frames: {
                    ...posMap.frames,
                    [frameID]: {
                      ...frame[frameID],
                    },
                  },
                };
              } else if (mutation === "DELETED") {
                return {
                  ...posMap,
                  frames: lodash.omit(posMap.frames, frameID),
                };
              }
              // new format
              const { createFrames, deleteFrames, updateFrames } =
                data.data.positionMapSubscription.frame;
              const newPosMap = produce(posMap, (posMapDraft) => {
                if (createFrames) {
                  posMapDraft.frames = {
                    ...posMap.frames,
                    ...createFrames,
                  };
                }
                if (deleteFrames) {
                  deleteFrames.map((id: string) => {
                    delete posMapDraft.frames[id];
                  });
                }
                if (updateFrames) {
                  posMapDraft.frames = {
                    ...posMap.frames,
                    ...updateFrames,
                  };
                }
              });
              return newPosMap;
            },
          },
        });
      },
      error(err) {
        console.error("SubscriptionError", err);
      },
    });
};

const subControlRecord = (client, userID: string) => {
  client
    .subscribe({
      query: SUB_CONTROL_RECORD,
    })
    .subscribe({
      next(data) {
        const { editBy, mutation, index, frameID } =
          data.data.controlRecordSubscription;
        if (userID !== editBy) {
          client.cache.modify({
            id: "ROOT_QUERY",
            fields: {
              controlFrameIDs(controlFrameIDs: Array<string>) {
                if (mutation === "CREATED") {
                  return [
                    ...controlFrameIDs.slice(0, index),
                    frameID,
                    ...controlFrameIDs.slice(index),
                  ];
                } else if (mutation === "DELETED") {
                  return controlFrameIDs.filter((e: string) => {
                    return e !== frameID;
                  });
                }
              },
            },
          });
        }
      },
      error(err) {
        console.error("SubscriptionError", err);
      },
    });
};

const subControlMap = (client) => {
  client
    .subscribe({
      query: SUB_CONTROL_MAP,
    })
    .subscribe({
      next(data) {
        const { mutation, frameID, frame } = data.data.controlMapSubscription;
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            ControlMap(controlMap) {
              // old format
              if (mutation === ("CREATED" || "UPDATED")) {
                return {
                  ...controlMap,
                  frames: {
                    ...controlMap.frames,
                    [frameID]: {
                      ...frame[frameID],
                    },
                  },
                };
              } else if (mutation === "DELETED") {
                return {
                  ...controlMap,
                  frames: lodash.omit(controlMap.frames, frameID),
                };
              }
              // new format
              const { createFrames, deleteFrames, updateFrames } =
                data.data.controlMapSubscription.frame;
              const newControlMap = produce(controlMap, (controlMapDraft) => {
                if (createFrames) {
                  controlMapDraft.frames = {
                    ...controlMap.frames,
                    ...createFrames,
                  };
                }
                if (deleteFrames) {
                  deleteFrames.map((id: string) => {
                    delete controlMapDraft.frames[id];
                  });
                }
                if (updateFrames) {
                  controlMapDraft.frames = {
                    ...controlMap.frames,
                    ...updateFrames,
                  };
                }
              });
              return newControlMap;
            },
          },
        });
      },
      error(err) {
        console.error("SubscriptionError", err);
      },
    });
};

const Subscriptions = (client, userID: string) => {
  subPosRecord(client, userID);
  subPosMap(client, userID);
  subControlRecord(client, userID);
  subControlMap(client);
};

export default Subscriptions;
