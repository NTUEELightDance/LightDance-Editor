import { registerActions } from "../registerActions";
// types
import type {
  State,
  Dancers,
  PartTypeMap,
  DancerName,
  Selected,
} from "../models";

import { dancerAgent } from "@/api";
import { getControl, getPos } from "../utils";

const actions = registerActions({
  initDancers: async (state: State) => {
    const dancersData = await dancerAgent.getDancers();
    if (!dancersData) {
      return;
    }

    const dancerNames: DancerName[] = dancersData.map((dancer) => dancer.name);
    const dancers = dancersData.reduce(
      (acc, dancer) => ({
        ...acc,
        [dancer.name]: dancer.parts.map((part) => part.name),
      }),
      {} as Dancers
    );

    const partTypeMap: PartTypeMap = {};
    dancersData.forEach((dancer) => {
      dancer.parts.forEach((part) => {
        partTypeMap[part.name] = part.type;
      });
    });

    const selected = dancerNames.reduce(
      (acc, dancerName) => ({
        ...acc,
        [dancerName]: {
          selected: false,
          parts: [],
        },
      }),
      {} as Selected
    );

    state.dancerNames = dancerNames;
    state.dancers = dancers;
    state.partTypeMap = partTypeMap;
    state.dancersArray = dancersData;
    state.selected = selected;
  },

  // depends on initDancers
  initCurrentStatus: async (state: State) => {
    const [controlMap, controlRecord] = await getControl();

    state.currentStatus = controlMap[controlRecord[0]].status;
  },

  // depends on initDancers
  initCurrentPos: async (state: State) => {
    const [posMap, posRecord] = await getPos();
    state.currentPos = posMap[posRecord[0]].pos;
  },
});

export const { initDancers, initCurrentStatus, initCurrentPos } = actions;
