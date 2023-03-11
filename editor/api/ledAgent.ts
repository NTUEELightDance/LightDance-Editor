// gql
import client from "client";
import {
  GET_LED_MAP,
  ADD_LED_EFFECT,
  EDIT_LED_EFFECT,
  DELETE_LED_EFFECT,
  LEDMapQueryResponseData,
  AddLEDEffectMutationResponseData,
  AddLEDEffectMutationVariables,
  EditLEDEffectMutationResponseData,
  EditLEDEffectMutationVariables,
  DeleteLEDEffectMutationResponseData,
  DeleteLEDEffectMutationVariables,
} from "graphql";
import type {
  LEDEffectFramePayload,
  LEDPartName,
  LEDEffectID,
} from "@/core/models";
import { notification } from "@/core/utils";

export const ledAgent = {
  getLedMapPayload: async () => {
    const ledMapData = await client.query<LEDMapQueryResponseData>({
      query: GET_LED_MAP,
    });
    return ledMapData.data.LEDMap.LEDMap;
  },

  addLEDEffect: async (addLEDEffectInput: {
    frames: LEDEffectFramePayload[];
    name: string;
    partName: LEDPartName;
    repeat: number;
  }) => {
    try {
      const { data: response } = await client.mutate<
        AddLEDEffectMutationResponseData,
        AddLEDEffectMutationVariables
      >({
        mutation: ADD_LED_EFFECT,
        variables: {
          input: {
            frames: {
              set: addLEDEffectInput.frames,
            },
            name: addLEDEffectInput.name,
            partName: addLEDEffectInput.partName,
            repeat: addLEDEffectInput.repeat,
          },
        },
        refetchQueries: [
          {
            query: GET_LED_MAP,
          },
        ],
      });
      notification.success("add succeeded");
      return response?.addLEDEffect;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  saveLEDEffect: async (saveLEDEffectInput: {
    id: number;
    name: string;
    repeat: number;
    frames: LEDEffectFramePayload[];
  }) => {
    try {
      const { data: response } = await client.mutate<
        EditLEDEffectMutationResponseData,
        EditLEDEffectMutationVariables
      >({
        mutation: EDIT_LED_EFFECT,
        variables: {
          input: {
            id: saveLEDEffectInput.id,
            name: saveLEDEffectInput.name,
            repeat: saveLEDEffectInput.repeat,
            frames: {
              set: saveLEDEffectInput.frames,
            },
          },
        },
        refetchQueries: [
          {
            query: GET_LED_MAP,
          },
        ],
      });
      notification.success("edit succeeded");
      return response?.editLEDEffect;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteLEDEffect: async (effectID: LEDEffectID) => {
    try {
      const { data: response } = await client.mutate<
        DeleteLEDEffectMutationResponseData,
        DeleteLEDEffectMutationVariables
      >({
        mutation: DELETE_LED_EFFECT,
        variables: {
          deleteLedEffectId: effectID,
        },
        refetchQueries: [
          {
            query: GET_LED_MAP,
          },
        ],
      });
      notification.success("delete succeeded");
      return response?.deleteLEDEffect;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
