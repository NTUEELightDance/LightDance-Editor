import type { ApolloClient, NormalizedCacheObject } from "@apollo/client";

import {
  SUB_POS_RECORD,
  SUB_POS_MAP,
  SUB_CONTROL_RECORD,
  SUB_CONTROL_MAP,
  SUB_EFFECT_LIST,
  ColorSubscriptionData,
  SUB_COLOR,
} from "../graphql";

import { setColorMap, setControlMap } from "@/core/actions";
import { toColorMap, toControlMap, toPosMap } from "@/core/utils/convert";
import { setPosMap } from "@/core/actions/posMap";

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
            async positionFrameIDs(positionFrameIDs) {
              if (positionFrameIDs instanceof Promise) {
                positionFrameIDs = await positionFrameIDs;
              }

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
            async PosMap(posMap) {
              if (posMap instanceof Promise) {
                posMap = await posMap;
              }

              const frame = data.data.positionMapSubscription.frame;

              const { createFrames, deleteFrames, updateFrames } = frame;

              const newPosMap = {
                ...posMap,
                frameIds: await posMap.frameIds,
              };

              newPosMap.frameIds = {
                ...newPosMap.frameIds,
                ...createFrames,
              };

              deleteFrames.forEach((id: string) => {
                delete newPosMap.frameIds[id];
              });

              newPosMap.frameIds = {
                ...newPosMap.frameIds,
                ...updateFrames,
              };

              setPosMap({
                payload: toPosMap(newPosMap.frameIds),
              });

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
            async controlFrameIDs(controlFrameIDs) {
              if (controlFrameIDs instanceof Promise) {
                controlFrameIDs = await controlFrameIDs;
              }

              const { index, addID, updateID, deleteID } =
                data.data.controlRecordSubscription;
              let newControlRecord = [...controlFrameIDs];
              if (addID.length > 0) {
                newControlRecord.splice(index, 0, ...addID);
              }
              if (updateID.length > 0) {
                const length = updateID.length;
                const updateIndex = newControlRecord.indexOf(updateID[0]);
                newControlRecord.splice(updateIndex, length);
                newControlRecord.splice(index, 0, ...updateID);
              }
              if (deleteID.length > 0) {
                newControlRecord = newControlRecord.filter(
                  (id: string) => !deleteID.includes(id)
                );
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
            async ControlMap(controlMap) {
              if (controlMap instanceof Promise) {
                controlMap = await controlMap;
              }

              const frame = data.data.controlMapSubscription.frame;

              const { createFrames, deleteFrames, updateFrames } = frame;

              const newControlMap = {
                ...controlMap,
                frameIds: await controlMap.frameIds,
              };

              newControlMap.frameIds = {
                ...newControlMap.frameIds,
                ...createFrames,
              };

              deleteFrames.map((id: string) => {
                delete newControlMap.frameIds[id];
              });

              newControlMap.frameIds = {
                ...newControlMap.frameIds,
                ...updateFrames,
              };

              setControlMap({
                payload: toControlMap(newControlMap.frameIds),
              });

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
        client.cache.modify({
          id: "ROOT_QUERY",
          fields: {
            async effectList(_effectList) {
              if (_effectList instanceof Promise) {
                _effectList = await _effectList;
              }

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
                    e.id.toString() !==
                    data.data.effectListSubscription.effectListID
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

const subColorMap = (client: ApolloClient<NormalizedCacheObject>) => {
  client.subscribe<ColorSubscriptionData>({ query: SUB_COLOR }).subscribe({
    next({ data }) {
      client.cache.modify({
        id: "ROOT_QUERY",
        fields: {
          async colorMap(colorMap) {
            if (!data) return colorMap;
            if (colorMap instanceof Promise) {
              colorMap = await colorMap;
            }

            const newColorMap = {
              ...colorMap,
              colorMap: await colorMap.colorMap,
            };

            const {
              color: colorName,
              id: colorID,
              colorCode: rgb,
            } = data.colorSubscription;

            switch (data.colorSubscription.mutation) {
              case "CREATED":
                newColorMap.colorMap = {
                  ...newColorMap.colorMap,
                  [colorID]: {
                    colorCode: rgb,
                    color: colorName,
                  },
                };
                break;
              case "UPDATED":
                newColorMap.colorMap = {
                  ...newColorMap.colorMap,
                  [colorID]: {
                    colorCode: rgb,
                    color: colorName,
                  },
                };
                break;
              case "DELETED":
                delete newColorMap.colorMap[colorID];
                break;
            }

            setColorMap({
              payload: toColorMap(newColorMap.colorMap),
            });

            return newColorMap;
          },
        },
      });
    },
  });
};

const Subscriptions = (client: ApolloClient<NormalizedCacheObject>) => {
  subPosRecord(client);
  subPosMap(client);
  subControlRecord(client);
  subControlMap(client);
  subEffectList(client);
  subColorMap(client);
};

export default Subscriptions;
