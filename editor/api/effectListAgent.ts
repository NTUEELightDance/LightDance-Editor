import {
  ADD_EFFECT_LIST,
  APPLY_EFFECT_LIST,
  DELETE_EFFECT_LIST,
  GET_EFFECT_LIST,
} from "graphql";
import client from "../client";

export const effectListAgent = {
  getEffectList: async () => {
    const effectListData = await client.query({ query: GET_EFFECT_LIST });
    return effectListData.data.effectList;
  },
  addEffectList: async (name: string, start: number, end: number) => {
    try {
      await client.mutate({
        mutation: ADD_EFFECT_LIST,
        variables: {
          end,
          start,
          description: name,
        },
      });
    } catch (error) {
      console.error(error);
    }
  },
  deleteEffectList: async (deleteId: string) => {
    try {
      const response = await client.mutate({
        mutation: DELETE_EFFECT_LIST,
        variables: {
          deleteEffectListId: deleteId,
        },
      });
      if (response.data.deleteEffectList.ok)
        alert(`[SUCCESS] Delete effect: ${deleteId}`);
      else alert(`[FAILED] Delete: effect: ${deleteId}`);
    } catch (error) {
      console.error(error);
    }
  },
  applyEffectList: async (clear: boolean, start: number, applyId: string) => {
    try {
      const response = await client.mutate({
        mutation: APPLY_EFFECT_LIST,
        variables: {
          clear,
          start,
          applyEffectListId: applyId,
        },
      });
      if (response.data.applyEffectList.ok)
        alert(`[SUCCESS] ${response.data.applyEffectList.msg}`);
      else alert(`[FAILED] ${response.data.applyEffectList.msg}`);
    } catch (error) {
      console.error(error);
    }
  },
};
