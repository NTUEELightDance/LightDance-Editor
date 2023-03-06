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
import { NO_EFFECT } from "@/constants";
import { getLedMap } from "../utils";
import { binarySearchFrameMap } from "../utils";
import { updateLedEffect } from "../utils";
import { ControlMap } from "../models";
import { ControlRecord } from "../models";
import { PartTypeMap } from "../models";
import { Dancers } from "../models";

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
    }
  ) => {
    const { partName, effectName } = payload;
    state.currentLEDPartName = partName;
    state.currentLEDEffectName = effectName;
    state.currentLEDEffectStart = state.currentTime;
    state.currentLEDEffect = {
      repeat: 1,
      effects: [],
    };
    state.selectionMode = "LED_MODE";
  },

  exitLEDEditor: (state: State) => {
    state.currentLEDEffectName = null;
    state.currentLEDPartName = null;
    state.currentLEDEffectStart = 0;
    state.currentLEDEffect = null;
  },

  setModeToLEDMode: (state: State) => {
    state.selectionMode = "LED_MODE";
  },

  /**
   * Generate LedEffectRecord
   * According to dancers, controlMap and controlRecord
   * stripped out NO_EFFECT source
   * @param state
   */
  syncLEDEffectRecord: async (state: State) => {
    const [controlMap, controlRecord] = await getControl();
    const { dancers, partTypeMap } = state;
    const ledEffectRecord = await generateLEDEffectRecord(
      controlMap,
      controlRecord,
      dancers,
      partTypeMap
    );
    state.ledEffectRecord = ledEffectRecord;
  },

  syncCurrentLEDStatus: async (state: State) => {
    const [controlMap, controlRecord] = await getControl();
    const ledMap = await getLedMap();

    const index = binarySearchFrameMap(
      controlRecord,
      controlMap,
      state.currentTime
    );

    const currentFrameId = controlRecord[index];

    const pseudoControlMap: ControlMap = {
      ...controlMap,
      [currentFrameId]: {
        fade: state.currentFade,
        start: state.currentTime,
        status: state.currentStatus,
      },
    };

    state.currentLEDStatus = updateLedEffect(
      pseudoControlMap,
      state.ledEffectRecord,
      state.currentLEDStatus,
      ledMap,
      state.currentTime
    );
  },
});

async function generateLEDEffectRecord(
  controlMap: ControlMap,
  controlRecord: ControlRecord,
  dancers: Dancers,
  partTypeMap: PartTypeMap
) {
  const ledEffectRecord: LEDEffectRecord = {};

  // initialize the ledEffectRecord
  Object.entries(dancers).map(([dancerName, parts]) => {
    ledEffectRecord[dancerName] = {};
    parts.forEach((partName) => {
      if (partTypeMap[partName] === "LED") {
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
            partTypeMap[partName] === "LED" &&
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
  setModeToLEDMode,
  syncLEDEffectRecord,
  syncCurrentLEDStatus,
  addFrameToCurrentLEDEffect,
  deleteFrameFromCurrentLEDEffect,
  updateFrameInCurrentLEDEffect,
  setupLEDEditor,
  exitLEDEditor,
} = actions;
