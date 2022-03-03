import { registerActions } from "../registerActions";

import {
  State,
  PartPayloadType,
  DeleteGroupError,
  AddNewGroupError,
  EditGroupError,
} from "../models";

import { asyncSetItem } from "../utils";
import { GROUP } from "constants";

const actions = registerActions({
  setPartGroups: (state: State, payload: PartPayloadType) => {
    state.partGroups = payload;
  },

  addNewGroup: async (
    state: State,
    payload: { groupName: string; content: string[] }
  ) => {
    if (payload.groupName.length === 0) throw "EMPTY" as AddNewGroupError;
    if (state.partGroups.hasOwnProperty(payload.groupName))
      throw "EXISTED" as AddNewGroupError;

    state.partGroups[payload.groupName] = payload.content;

    asyncSetItem(GROUP, JSON.stringify(state.partGroups));
  },

  removeGroup: async (state: State, payload: string) => {
    if (!state.partGroups.hasOwnProperty(payload))
      throw "DNE" as AddNewGroupError;

    delete state.partGroups[payload];

    asyncSetItem(GROUP, JSON.stringify(state.partGroups));
  },

  editGroup: async (
    state: State,
    payload: { groupName: string; content: string[] }
  ) => {
    if (!state.partGroups.hasOwnProperty(payload.groupName))
      throw "DNE" as EditGroupError;

    state.partGroups[payload.groupName] = payload.content;

    asyncSetItem(GROUP, JSON.stringify(state.partGroups));
  },
});

export const { setPartGroups, addNewGroup, removeGroup, editGroup } = actions;
