// gql
import client from "client";
import { GET_LED_MAP, ADD_LED, EDIT_LED, DELETE_LED } from "graphql";
import type { LEDMapPayload, PartName } from "@/core/models";

export const ledAgent = {
  getLedMapPayload: async () => {
    const ledMapData = await client.query({ query: GET_LED_MAP });
    return ledMapData.data.LEDMap.LEDMap as LEDMapPayload;
  },

  AddLED: async (addLEDInput) => {
    try {
      const { data: response } = await client.mutate({
        mutation: ADD_LED,
        variables: {
          input: addLEDInput,
        },
        refetchQueries: [
          {
            query: GET_LED_MAP,
          },
        ],
      });

      return response.addLED.id.toString() as string;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  saveLED: async (saveLEDInput) => {
    try {
      const { data: response } = await client.mutate({
        mutation: EDIT_LED,
        variables: {
          input: saveLEDInput,
        },
        refetchQueries: [
          {
            query: GET_LED_MAP,
          },
        ],
      });

      return response.editLED.id.toString() as string;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteLED: async (effectName: string, partName: PartName) => {
    try {
      const { data: response } = await client.mutate({
        mutation: DELETE_LED,
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

      return response.deleteLED.ok;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
