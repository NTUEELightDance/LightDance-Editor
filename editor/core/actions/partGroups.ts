import { registerActions } from "../registerActions";

import { State, PartPayloadType } from "../models";

import { asyncSetItem } from "core/utils";
import { GROUP } from "constants";

const actions = registerActions({
  setPartGroups: (state: State, payload: PartPayloadType) => {
    state.partGroups = payload;
  },

  addNewGroup: async (
    state: State,
    payload: { groupName: string; content: string[] }
  ) => {
    if (state.partGroups.hasOwnProperty(payload.groupName))
      return Error(
        `Add new group failed, group name: ${payload.groupName} already exists`
      );

    state.partGroups[payload.groupName] = payload.content;

    asyncSetItem(GROUP, JSON.stringify(state.partGroups));
  },

  removeGroup: async (state: State, payload: string) => {
    if (!state.partGroups.hasOwnProperty(payload))
      return Error(
        `Delete group failed, group name: ${payload} does not exist`
      );

    delete state.partGroups[payload];

    asyncSetItem(GROUP, JSON.stringify(state.partGroups));
  },

  editGroup: async (
    state: State,
    payload: { groupName: string; content: string[] }
  ) => {
    if (!state.partGroups.hasOwnProperty(payload.groupName))
      return Error(
        `Edit group failed, group name: ${payload.groupName} does not exist`
      );

    state.partGroups[payload.groupName] = payload.content;

    asyncSetItem(GROUP, JSON.stringify(state.partGroups));
  },
});

export const { setPartGroups, addNewGroup, removeGroup, editGroup } = actions;
