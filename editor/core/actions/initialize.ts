import { registerActions } from "../registerActions";
// types
import type {
  State,
  Dancers,
  PartTypeMap,
  DancerName,
  Selected,
  DancerPartIndexMap,
  PartName,
  CurrentLEDStatus,
} from "../models";

import { dancerAgent } from "@/api";
import { getControl, getPos } from "../utils";
import { colorAgent } from "@/api/colorAgent";
import { syncCurrentLEDStatus } from "./led";

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

    const dancerPartIndexMap: DancerPartIndexMap = {};
    dancersData.forEach((dancer, index) => {
      const parts: Record<PartName, number> = {};
      dancer.parts.forEach((part, partIndex) => {
        parts[part.name] = partIndex;
      });

      dancerPartIndexMap[dancer.name] = {
        index,
        parts,
      };
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
    state.dancerPartIndexMap = dancerPartIndexMap;

    state.selected = selected;
  },

  // depends on initDancers
  initCurrentStatus: async (state: State) => {
    const [controlMap, controlRecord] = await getControl();

    state.currentStatus = controlMap[controlRecord[0]].status;
    state.statusStack.push(state.currentStatus);
    state.statusStackIndex = 0;
  },

  // depends on initDancers
  initCurrentPos: async (state: State) => {
    const [posMap, posRecord] = await getPos();

    state.currentPos = posMap[posRecord[0]].pos;
  },

  initColorMap: async (state: State) => {
    const colorMap = await colorAgent.getColorMap();

    state.colorMap = colorMap;
  },

  initCurrentLEDStatus: (state: State) => {
    const { dancers, partTypeMap } = state;
    const tmp: CurrentLEDStatus = {};
    Object.entries(dancers).map(([dancerName, parts]) => {
      tmp[dancerName] = {};
      parts.forEach((part) => {
        if (partTypeMap[part] === "LED") {
          tmp[dancerName][part] = {
            effect: [],
            effectIndex: 0,
            recordIndex: 0,
            alpha: 0,
          };
        }
      });
    });
    state.currentLEDStatus = tmp;
  },
});

export const {
  initDancers,
  initCurrentStatus,
  initCurrentPos,
  initColorMap,
  initCurrentLEDStatus,
} = actions;
