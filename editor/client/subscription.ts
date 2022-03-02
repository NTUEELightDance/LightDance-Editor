import {
  SUB_POS_RECORD,
  SUB_POS_MAP,
  SUB_CONTROL_RECORD,
  SUB_CONTROL_MAP,
} from "../graphql";
import lodash from "lodash";

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
        const { editBy, mutation, frameID, frame } =
          data.data.positionMapSubscription;
        if (userID !== editBy) {
          client.cache.modify({
            id: "ROOT_QUERY",
            fields: {
              PosMap(posMap) {
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
        const { createFrames, deleteFrames, updateFrames } =
          data.data.controlMapSubscription.frame;
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            ControlMap(controlMap) {
              if (createFrames) {
                controlMap = {
                  ...controlMap,
                  frames: {
                    ...controlMap.frames,
                    ...createFrames,
                  },
                };
              }
              if (deleteFrames) {
                deleteFrames.map((id: string) => {
                  controlMap = {
                    ...controlMap,
                    frames: lodash.omit(controlMap.frames, id),
                  };
                });
              }
              if (updateFrames) {
                controlMap = {
                  ...controlMap,
                  frames: {
                    ...controlMap.frames,
                    ...updateFrames,
                  },
                };
              }
              return controlMap;
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
