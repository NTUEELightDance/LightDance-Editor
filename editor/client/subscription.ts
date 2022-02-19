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
        if (userID !== data.data.positionRecordSubscription.editBy) {
          client.cache.modify({
            id: "ROOT_QUERY",
            fields: {
              positionFrameIDs(positionFrameIDs: Array<string>) {
                if (
                  data.data.positionRecordSubscription.mutation === "CREATED"
                ) {
                  return [
                    ...positionFrameIDs.slice(
                      0,
                      data.data.positionRecordSubscription.index
                    ),
                    data.data.positionRecordSubscription.frameID,
                    ...positionFrameIDs.slice(
                      data.data.positionRecordSubscription.index
                    ),
                  ];
                } else if (
                  data.data.positionRecordSubscription.mutation === "DELETED"
                ) {
                  return positionFrameIDs.filter((e: string) => {
                    return e !== data.data.positionRecordSubscription.frameID;
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
        if (userID !== data.data.positionMapSubscription.editBy) {
          client.cache.modify({
            id: "ROOT_QUERY",
            fields: {
              PosMap(posMap) {
                if (
                  data.data.positionMapSubscription.mutation ===
                  ("CREATED" || "UPDATED")
                ) {
                  return {
                    ...posMap,
                    frames: {
                      ...posMap.frames,
                      [data.data.positionMapSubscription.frameID]: {
                        ...data.data.positionMapSubscription.frame[
                          data.data.positionMapSubscription.frameID
                        ],
                      },
                    },
                  };
                } else if (
                  data.data.positionMapSubscription.mutation === "DELETED"
                ) {
                  return {
                    ...posMap,
                    frames: lodash.omit(
                      posMap.frames,
                      data.data.positionMapSubscription.frameID
                    ),
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
        if (userID !== data.data.controlRecordSubscription.editBy) {
          client.cache.modify({
            id: "ROOT_QUERY",
            fields: {
              controlFrameIDs(controlFrameIDs: Array<string>) {
                if (
                  data.data.controlRecordSubscription.mutation === "CREATED"
                ) {
                  return [
                    ...controlFrameIDs.slice(
                      0,
                      data.data.controlRecordSubscription.index
                    ),
                    data.data.controlRecordSubscription.frameID,
                    ...controlFrameIDs.slice(
                      data.data.controlRecordSubscription.index
                    ),
                  ];
                } else if (
                  data.data.controlRecordSubscription.mutation === "DELETED"
                ) {
                  return controlFrameIDs.filter((e: string) => {
                    return e !== data.data.controlRecordSubscription.frameID;
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

const subControlMap = (client, userID: string) => {
  client
    .subscribe({
      query: SUB_CONTROL_MAP,
    })
    .subscribe({
      next(data) {
        if (userID !== data.data.controlMapSubscription.editBy) {
          client.cache.modify({
            id: "ROOT_QUERY",
            fields: {
              ControlMap(controlMap) {
                if (
                  data.data.controlMapSubscription.mutation ===
                  ("CREATED" || "UPDATED")
                ) {
                  return {
                    ...controlMap,
                    frames: {
                      ...controlMap.frames,
                      [data.data.controlMapSubscription.frameID]: {
                        ...data.data.controlMapSubscription.frame[
                          data.data.controlMapSubscription.frameID
                        ],
                      },
                    },
                  };
                } else if (
                  data.data.controlMapSubscription.mutation === "DELETED"
                ) {
                  return {
                    ...controlMap,
                    frames: lodash.omit(
                      controlMap.frames,
                      data.data.controlMapSubscription.frameID
                    ),
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

const Subscriptions = (client, userID: string) => {
  subPosRecord(client, userID);
  subPosMap(client, userID);
  subControlRecord(client, userID);
  subControlMap(client, userID);
};

export default Subscriptions;
