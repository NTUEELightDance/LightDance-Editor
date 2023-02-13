import client from "@/client";

import {
  GET_COLOR_MAP,
  ADD_COLOR,
  GET_CONTROL_MAP,
  EDIT_COLOR,
  DELETE_COLOR,
} from "@/graphql";

import type { ColorMap } from "@/core/models";

export const colorAgent = {
  getColorMap: async (): Promise<ColorMap> => {
    const { data: colorMapData } = await client.query({
      query: GET_COLOR_MAP,
    });

    return colorMapData.colorMap.colorMap as ColorMap;
  },

  addColor: async (color: string, colorCode: string) => {
    try {
      await client.mutate({
        mutation: ADD_COLOR,
        variables: {
          color: {
            color,
            colorCode,
          },
        },
        refetchQueries: [
          {
            query: GET_COLOR_MAP,
          },
        ],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  editColorCode: async (color: string, newColorCode: string) => {
    try {
      await client.mutate({
        mutation: EDIT_COLOR,
        variables: {
          color,
          colorCode: newColorCode,
        },
        refetchQueries: [
          {
            query: GET_COLOR_MAP,
          },
        ],
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteColor: async (color: string) => {
    try {
      const { data: response } = await client.mutate({
        mutation: DELETE_COLOR,
        variables: {
          color,
        },
        refetchQueries: [
          {
            query: GET_COLOR_MAP,
          },
          {
            query: GET_CONTROL_MAP,
          },
        ],
      });

      const ok = response.deleteColor.ok;

      if (!ok) {
        throw new Error("This color is being used is some control frames.");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
