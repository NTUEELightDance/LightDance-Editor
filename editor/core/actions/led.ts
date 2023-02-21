import { cloneDeep } from "lodash";
import { registerActions } from "../registerActions";

import type {
  State,
  ControlMapStatus,
  LEDEffectRecord,
  DancerName,
  DancerStatus,
  LEDData,
  LEDMap,
  LEDEffect,
  LEDEffectFrame,
  LEDPartName,
} from "../models";
import { isLEDPartName } from "../models";
// utils
import { getControl } from "../utils";
import { LED as LED_TYPE, NO_EFFECT } from "@/constants";

const actions = registerActions({
  setLEDMap: async (state: State, payload: LEDMap) => {
    state.ledMap = payload;
  },

  setCurrentLEDPartName: (state: State, payload: string) => {
    if (isLEDPartName(payload)) {
      state.currentLEDPartName = payload;
    } else {
      throw new Error(`Invalid LED part name: ${payload}`);
    }
  },

  setCurrentLEDEffectName: (state: State, payload: string) => {
    state.currentLEDEffectName = payload;
  },

  setCurrentLEDEffect: (state: State, payload: LEDEffect) => {
    state.currentLEDEffect = payload;
  },

  // payload is the repeat number
  setCurrentLEDEffectRepeat: (state: State, payload: number) => {
    if (state.currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }
    const newCurrentLEDEffect = cloneDeep(state.currentLEDEffect);
    newCurrentLEDEffect.repeat = payload;
    state.currentLEDEffect = newCurrentLEDEffect;
  },

  addFrameToCurrentLEDEffect: (state: State, payload: LEDEffectFrame) => {
    if (state.currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }
    const newCurrentLEDEffect = cloneDeep(state.currentLEDEffect);
    newCurrentLEDEffect.effects.push(payload);
    newCurrentLEDEffect.effects.sort((a, b) => a.start - b.start);
    state.currentLEDEffect = newCurrentLEDEffect;
  },

  updateFrameInCurrentLEDEffect: (
    state: State,
    payload: {
      index: number;
      frame: LEDEffectFrame;
    }
  ) => {
    if (state.currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }
    const newCurrentLEDEffect = cloneDeep(state.currentLEDEffect);
    newCurrentLEDEffect.effects[payload.index] = payload.frame;
    newCurrentLEDEffect.effects.sort((a, b) => a.start - b.start);
    state.currentLEDEffect = newCurrentLEDEffect;
  },

  // payload is the index of the frame to be deleted
  deleteFrameFromCurrentLEDEffect: (state: State, payload: number) => {
    if (state.currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }
    const newCurrentLEDEffect = cloneDeep(state.currentLEDEffect);
    newCurrentLEDEffect.effects.splice(payload, 1);
    state.currentLEDEffect = newCurrentLEDEffect;
  },

  setupLEDEditor: (
    state: State,
    payload: {
      partName: LEDPartName;
      effectName: string;
      start: number;
    }
  ) => {
    const { partName, effectName, start } = payload;
    state.currentLEDPartName = partName;
    state.currentLEDEffectName = effectName;
    state.currentLEDEffectStart = start;
    state.currentLEDEffect = {
      repeat: 1,
      effects: [],
    };
  },

  exitLEDEditor: (state: State) => {
    state.currentLEDEffectName = "";
    state.currentLEDPartName = "";
    state.currentLEDEffectStart = 0;
    state.currentLEDEffect = null;
  },

  /**
   * Generate LedEffectRecord
   * According to dancers, controlMap and controlRecord
   * stripped out NO_EFFECT source
   * @param state
   */
  syncLEDEffectRecord: async (state: State) => {
    const ledEffectRecord = await generateLEDEffectRecord(state);
    state.ledEffectRecord = ledEffectRecord;
  },
});

async function generateLEDEffectRecord(state: State) {
  const [controlMap, controlRecord] = await getControl();
  const { dancers, partTypeMap } = state;

  const ledEffectRecord: LEDEffectRecord = {};

  // initialize the ledEffectRecord
  Object.entries(dancers).map(([dancerName, parts]) => {
    ledEffectRecord[dancerName] = {};
    parts.forEach((partName) => {
      if (partTypeMap[partName] === LED_TYPE) {
        ledEffectRecord[dancerName][partName] = [];
      }
    });
  });

  // go through control record, add the index if the led source is NOT NO_EFFECT
  controlRecord.forEach((id: string) => {
    const status: ControlMapStatus = controlMap[id].status;
    Object.entries(status).forEach(
      ([dancerName, dancerStatus]: [DancerName, DancerStatus]) => {
        Object.entries(dancerStatus).forEach(([partName, part]) => {
          if (
            partTypeMap[partName] === LED_TYPE &&
            (part as LEDData).src !== NO_EFFECT
          ) {
            ledEffectRecord[dancerName][partName].push(id);
          }
        });
      }
    );
  });

  return ledEffectRecord;
}

export const {
  setCurrentLEDPartName,
  setCurrentLEDEffectName,
  setCurrentLEDEffect,
  setCurrentLEDEffectRepeat,
  setLEDMap,
  syncLEDEffectRecord,
  addFrameToCurrentLEDEffect,
  deleteFrameFromCurrentLEDEffect,
  updateFrameInCurrentLEDEffect,
  setupLEDEditor,
  exitLEDEditor,
} = actions;
