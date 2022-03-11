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
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            positionFrameIDs(positionFrameIDs: Array<string>) {
              const { index, addID, updateID, deleteID } =
                data.data.controlRecordSubscription;
              const newPosRecord = produce(
                positionFrameIDs,
                (posRecordDraft) => {
                  if (addID) {
                    posRecordDraft.splice(index, 0, ...addID);
                  }
                  if (updateID) {
                  }
                  if (deleteID) {
                    deleteID.map((id: string) => {
                      const deleteIndex = posRecordDraft.indexOf(id);
                      posRecordDraft.splice(deleteIndex, 1);
                    });
                  }
                }
              );
              return newPosRecord;
            },
          },
        });
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
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            PosMap(posMap) {
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
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            controlFrameIDs(controlFrameIDs: Array<string>) {
              const { index, addID, updateID, deleteID } =
                data.data.controlRecordSubscription;
              const newControlRecord = produce(
                controlFrameIDs,
                (controlRecordDraft) => {
                  if (addID) {
                    controlRecordDraft.splice(index, 0, ...addID);
                  }
                  if (updateID) {
                  }
                  if (deleteID) {
                    deleteID.map((id: string) => {
                      const deleteIndex = controlRecordDraft.indexOf(id);
                      controlRecordDraft.splice(deleteIndex, 1);
                    });
                  }
                }
              );
              return newControlRecord;
            },
          },
        });
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
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            ControlMap(controlMap) {
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
