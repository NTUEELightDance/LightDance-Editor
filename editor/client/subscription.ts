import {
  SUB_POS_RECORD,
  SUB_POS_MAP,
  SUB_CONTROL_RECORD,
  SUB_CONTROL_MAP,
} from "../graphql";
import { produce } from "immer";

const subPosRecord = (client) => {
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
                data.data.positionRecordSubscription;
              const newPosRecord = produce(
                positionFrameIDs,
                (posRecordDraft) => {
                  if (addID.length) {
                    posRecordDraft.splice(index, 0, ...addID);
                  }
                  if (updateID.length) {
                    let length = updateID.length;
                    const updateIndex = posRecordDraft.indexOf(updateID[0]);
                    posRecordDraft.splice(updateIndex, length);
                    posRecordDraft.splice(index, 0, ...updateID);
                  }
                  if (deleteID.length) {
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

const subPosMap = (client) => {
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
                if (Object.keys(createFrames).length) {
                  posMapDraft.frames = {
                    ...posMapDraft.frames,
                    ...createFrames,
                  };
                }
                if (deleteFrames.length) {
                  deleteFrames.map((id: string) => {
                    delete posMapDraft.frames[id];
                  });
                }
                if (Object.keys(updateFrames).length) {
                  posMapDraft.frames = {
                    ...posMapDraft.frames,
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

const subControlRecord = (client) => {
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
                  if (addID.length) {
                    controlRecordDraft.splice(index, 0, ...addID);
                  }
                  if (updateID.length) {
                    let length = updateID.length;
                    const updateIndex = controlRecordDraft.indexOf(updateID[0]);
                    controlRecordDraft.splice(updateIndex, length);
                    controlRecordDraft.splice(index, 0, ...updateID);
                  }
                  if (deleteID.length) {
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
                if (Object.keys(createFrames).length) {
                  controlMapDraft.frames = {
                    ...controlMapDraft.frames,
                    ...createFrames,
                  };
                }
                if (deleteFrames.length) {
                  deleteFrames.map((id: string) => {
                    delete controlMapDraft.frames[id];
                  });
                }
                if (Object.keys(updateFrames).length) {
                  controlMapDraft.frames = {
                    ...controlMapDraft.frames,
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

const Subscriptions = (client) => {
  subPosRecord(client);
  subPosMap(client);
  subControlRecord(client);
  subControlMap(client);
};

export default Subscriptions;
