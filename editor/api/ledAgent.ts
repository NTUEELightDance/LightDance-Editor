// gql
import client from "client";
import {
  GET_LED_MAP,
  ADD_LED_EFFECT,
  EDIT_LED_EFFECT,
  DELETE_LED_EFFECT,
} from "graphql";
import type {
  LEDMapPayload,
  PartName,
  LEDEffectName,
  addLEDEffectPayload,
  saveLEDEffectInput,
  saveLEDEffectPayload,
} from "@/core/models";
import { notification } from "@/core/utils";

export const ledAgent = {
  getLedMapPayload: async () => {
    const ledMapData = await client.query({ query: GET_LED_MAP });
    return ledMapData.data.LEDMap.LEDMap as LEDMapPayload;
  },

  addLEDEffect: async (addLEDEffectInput: any) => {
    try {
      const { data: response } = await client.mutate({
        mutation: ADD_LED_EFFECT,
        variables: {
          input: addLEDEffectInput,
        },
        refetchQueries: [
          {
            query: GET_LED_MAP,
          },
        ],
      });
      notification.success("add succeeded");
      return response.addLED as addLEDEffectPayload;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  saveLEDEffect: async (saveLEDEffectInput: saveLEDEffectInput) => {
    try {
      const { data: response } = await client.mutate({
        mutation: EDIT_LED_EFFECT,
        variables: {
          input: saveLEDEffectInput,
        },
        refetchQueries: [
          {
            query: GET_LED_MAP,
          },
        ],
      });
      notification.success("edit succeeded");
      return response.editLED as saveLEDEffectPayload;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteLEDEffect: async (effectName: LEDEffectName, partName: PartName) => {
    try {
      const { data: response } = await client.mutate({
        mutation: DELETE_LED_EFFECT,
        variables: {
          input: {
            effectName,
            partName,
          },
        },
        refetchQueries: [
          {
            query: GET_LED_MAP,
          },
        ],
      });
      notification.success("delete succeeded");
      return response.deleteLED.ok;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
