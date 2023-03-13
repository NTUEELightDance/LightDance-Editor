import client from "@/client";
import { Color, ColorID } from "@/core/models";
import { hexToRGB } from "@/core/utils/convert";

import {
  GET_COLOR_MAP,
  ADD_COLOR,
  GET_CONTROL_MAP,
  EDIT_COLOR,
  DELETE_COLOR,
  AddColorMutationVariables,
  AddColorMutationResponseData,
  EditColorMutationResponseData,
  EditColorMutationVariables,
  DeleteColorMutationVariables,
  DeleteColorMutationResponseData,
  ColorQueryResponseData,
} from "@/graphql";

export const colorAgent = {
  getColorMap: async () => {
    const { data } = await client.query<ColorQueryResponseData>({
      query: GET_COLOR_MAP,
    });

    return data;
  },

  addColor: async ({ name, colorCode }: Pick<Color, "name" | "colorCode">) => {
    const colorRGB = hexToRGB(colorCode);

    try {
      const { data } = await client.mutate<
        AddColorMutationResponseData,
        AddColorMutationVariables
      >({
        mutation: ADD_COLOR,
        variables: {
          color: {
            color: name,
            colorCode: {
              set: colorRGB,
            },
          },
        },
        refetchQueries: [
          {
            query: GET_COLOR_MAP,
          },
        ],
      });

      return data?.addColor.id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  editColorCode: async ({
    id,
    name,
    colorCode,
  }: Pick<Color, "name" | "colorCode" | "id">) => {
    const colorRGB = hexToRGB(colorCode);

    try {
      await client.mutate<
        EditColorMutationResponseData,
        EditColorMutationVariables
      >({
        mutation: EDIT_COLOR,
        variables: {
          data: {
            color: {
              set: name,
            },
            colorCode: {
              set: colorRGB,
            },
          },
          editColorId: id,
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

  deleteColor: async (colorID: ColorID) => {
    try {
      const { data } = await client.mutate<
        DeleteColorMutationResponseData,
        DeleteColorMutationVariables
      >({
        mutation: DELETE_COLOR,
        variables: {
          deleteColorId: colorID,
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

      const ok = data?.deleteColor?.ok;

      if (!ok) {
        throw new Error(data?.deleteColor?.msg ?? "Unknown Error");
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        throw new Error(`Delete Color Failed ${error.message}`);
      }
    }
  },
};
