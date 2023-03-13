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
  LEDPartLengthMap,
  ColorMap,
} from "../models";

import { isLEDPartName } from "../models";

import { dancerAgent } from "@/api";
import { createBlack, getControl, getPos } from "../utils";
import { colorAgent } from "@/api/colorAgent";
import { rgbToHex } from "../utils/convert";

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
    const LEDPartLengthMap: LEDPartLengthMap = {};
    dancersData.forEach((dancer) => {
      dancer.parts.forEach((part) => {
        partTypeMap[part.name] = part.type;
        if (part.type === "LED") {
          LEDPartLengthMap[part.name] = part.length;
        }
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
    state.LEDPartLengthMap = LEDPartLengthMap;

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
    state.posStack.push(state.currentPos);
    state.posStackIndex = 0;
  },

  initColorMap: async (state: State) => {
    const colorMapResponseData = await colorAgent.getColorMap();

    const colorMap: ColorMap = Object.entries(
      await colorMapResponseData.colorMap.colorMap
    ).reduce((acc, [id, { color: name, colorCode: rgb }]) => {
      return {
        ...acc,
        [id]: {
          id: parseInt(id),
          name,
          colorCode: rgbToHex(rgb),
          rgb,
        },
      };
    }, {} as ColorMap);

    state.colorMap = colorMap;
  },

  initCurrentLEDStatus: async (state: State) => {
    const { dancers, LEDPartLengthMap } = state;
    const blackColorID = await createBlack();
    const tmp: CurrentLEDStatus = {};
    Object.entries(dancers).map(([dancerName, parts]) => {
      tmp[dancerName] = {};
      parts.forEach((part) => {
        if (isLEDPartName(part)) {
          const length = LEDPartLengthMap[part];
          tmp[dancerName][part] = {
            effect: [...Array(length)].map(() => ({
              colorID: blackColorID,
              alpha: 0,
            })),
            effectIndex: 0,
            recordIndex: 0,
            alpha: 10,
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
