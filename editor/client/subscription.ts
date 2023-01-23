import type { ApolloClient, NormalizedCacheObject } from "@apollo/client";

import {
  SUB_POS_RECORD,
  SUB_POS_MAP,
  SUB_CONTROL_RECORD,
  SUB_CONTROL_MAP,
  SUB_EFFECT_LIST,
} from "../graphql";
import cloneDeep from "lodash/cloneDeep";
import { log } from "core/utils";

const subPosRecord = (client: ApolloClient<NormalizedCacheObject>) => {
  client
    .subscribe({
      query: SUB_POS_RECORD,
    })
    .subscribe({
      next(data) {
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            positionFrameIDs(positionFrameIDs: string[]) {
              const { index, addID, updateID, deleteID } =
                data.data.positionRecordSubscription;
              const newPosRecord = [...positionFrameIDs];

              if (addID.length) {
                newPosRecord.splice(index, 0, ...addID);
              }
              if (updateID.length) {
                const length = updateID.length;
                const updateIndex = newPosRecord.indexOf(updateID[0]);
                newPosRecord.splice(updateIndex, length);
                newPosRecord.splice(index, 0, ...updateID);
              }
              if (deleteID.length) {
                deleteID.map((id: string) => {
                  const deleteIndex = newPosRecord.indexOf(id);
                  newPosRecord.splice(deleteIndex, 1);
                });
              }
              return newPosRecord;
            },
          },
        });
      },
      error(err) {
        throw new Error("SubscriptionError", err);
      },
    });
};

const subPosMap = (client: ApolloClient<NormalizedCacheObject>) => {
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
              const newPosMap = cloneDeep(posMap);

              if (Object.keys(createFrames).length > 0) {
                newPosMap.frames = {
                  ...newPosMap.frames,
                  ...createFrames,
                };
              }
              if (deleteFrames.length) {
                deleteFrames.map((id: string) => {
                  delete newPosMap.frames[id];
                });
              }
              if (Object.keys(updateFrames).length > 0) {
                newPosMap.frames = {
                  ...newPosMap.frames,
                  ...updateFrames,
                };
              }
              return newPosMap;
            },
          },
        });
      },
      error(err) {
        throw new Error("SubscriptionError", err);
      },
    });
};

const subControlRecord = (client: ApolloClient<NormalizedCacheObject>) => {
  client
    .subscribe({
      query: SUB_CONTROL_RECORD,
    })
    .subscribe({
      next(data) {
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            controlFrameIDs(controlFrameIDs: string[]) {
              const { index, addID, updateID, deleteID } =
                data.data.controlRecordSubscription;
              const newControlRecord = [...controlFrameIDs];
              if (addID.length) {
                newControlRecord.splice(index, 0, ...addID);
              }
              if (updateID.length) {
                const length = updateID.length;
                const updateIndex = newControlRecord.indexOf(updateID[0]);
                newControlRecord.splice(updateIndex, length);
                newControlRecord.splice(index, 0, ...updateID);
              }
              if (deleteID.length) {
                deleteID.map((id: string) => {
                  const deleteIndex = newControlRecord.indexOf(id);
                  newControlRecord.splice(deleteIndex, 1);
                });
              }
              return newControlRecord;
            },
          },
        });
      },
      error(err) {
        throw new Error("SubscriptionError", err);
      },
    });
};

const subControlMap = (client: ApolloClient<NormalizedCacheObject>) => {
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
              const newControlMap = cloneDeep(controlMap);
              if (Object.keys(createFrames).length > 0) {
                newControlMap.frames = {
                  ...newControlMap.frames,
                  ...createFrames,
                };
              }
              if (deleteFrames.length) {
                deleteFrames.map((id: string) => {
                  delete newControlMap.frames[id];
                });
              }
              if (Object.keys(updateFrames).length > 0) {
                newControlMap.frames = {
                  ...newControlMap.frames,
                  ...updateFrames,
                };
              }
              return newControlMap;
            },
          },
        });
      },
      error(err) {
        throw new Error("SubscriptionError", err);
      },
    });
};
const subEffectList = (client: ApolloClient<NormalizedCacheObject>) => {
  client
    .subscribe({
      query: SUB_EFFECT_LIST,
    })
    .subscribe({
      next(data) {
        log(data);
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            effectList(_effectList) {
              if (data.data.effectListSubscription.mutation === "CREATED") {
                return [
                  ..._effectList,
                  data.data.effectListSubscription.effectListData,
                ];
              } else if (
                data.data.effectListSubscription.mutation === "DELETED"
              ) {
                return _effectList.filter(
                  (e: any) =>
                    e.id !== data.data.effectListSubscription.effectListID
                );
              }
            },
          },
        });
      },
      error(err) {
        throw new Error("SubscriptionError", err);
      },
    });
};

const Subscriptions = (client: ApolloClient<NormalizedCacheObject>) => {
  subPosRecord(client);
  subPosMap(client);
  subControlRecord(client);
  subControlMap(client);
  subEffectList(client);
};

export default Subscriptions;
