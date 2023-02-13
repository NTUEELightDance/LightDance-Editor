import client from "../client";

import {
  ADD_EFFECT_LIST,
  APPLY_EFFECT_LIST,
  DELETE_EFFECT_LIST,
  GET_CONTROL_MAP,
  GET_CONTROL_RECORD,
} from "@/graphql";

import { notification } from "@/core/utils";

export const effectListAgent = {
  addEffectList: async (name: string, start: number, end: number) => {
    try {
      await client.mutate({
        mutation: ADD_EFFECT_LIST,
        variables: {
          description: name,
          start,
          end,
        },
      });

      notification.success("Effect List Added");
    } catch (error) {
      console.error(error);
      notification.error("Effect List Add Failed");
    }
  },

  deleteEffectList: async (deleteId: string) => {
    try {
      const response = await client.mutate({
        mutation: DELETE_EFFECT_LIST,
        variables: {
          deleteEffectListId: parseInt(deleteId),
        },
      });

      if (response.data.deleteEffectList.ok) {
        notification.success("Effect List Deleted");
      } else {
        notification.error("Effect List Delete Failed");
      }
    } catch (error) {
      console.error(error);
      notification.error("Effect List Delete Failed");
    }
  },

  applyEffectList: async (start: number, applyId: string) => {
    try {
      const response = await client.mutate({
        mutation: APPLY_EFFECT_LIST,
        variables: {
          start,
          applyEffectListId: parseInt(applyId),
        },
        refetchQueries: [
          {
            query: GET_CONTROL_RECORD,
          },
          {
            query: GET_CONTROL_MAP,
          },
        ],
      });
      if (response.data.applyEffectList.ok) {
        notification.success("Effect List Applied");
      } else {
        notification.error("Effect List Apply Failed");
      }
    } catch (error) {
      console.error(error);
      notification.error("Effect List Apply Failed");
    }
  },
};
