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
  LEDPartName,
  LEDBulbData,
} from "../models";
import { isLEDPartName } from "../models";
// utils
import {
  binarySearchObjects,
  createEmptyLEDEffectFrame,
  getControl,
  getDancerFromLEDpart,
  updateFrameByTimeMap,
} from "../utils";
import { NO_EFFECT } from "@/constants";
import { getLedMap } from "../utils";
import { updateCurrentLEDStatus } from "../utils";
import { ControlMap } from "../models";
import { ControlRecord } from "../models";
import { PartTypeMap } from "../models";
import { Dancers } from "../models";
import { initCurrentLEDStatus } from "./initialize";
import { cancelEditMode } from "./edit";
import { setCurrentTime } from "./timeData";

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

  editCurrentLEDStatus: (
    state: State,
    payload: {
      dancerName: DancerName;
      partName: LEDPartName;
      LEDBulbsMap: Map<number, Partial<LEDBulbData>>;
    }
  ) => {
    const { dancerName, partName, LEDBulbsMap } = payload;
    const newCurrentLEDStatus = cloneDeep(state.currentLEDStatus);

    for (const [bulbIndex, bulbData] of LEDBulbsMap.entries()) {
      for (const [key, value] of Object.entries(bulbData)) {
        // @ts-expect-error the key is guaranteed to be in the type
        newCurrentLEDStatus[dancerName][partName].effect[bulbIndex][key] =
          value;
      }
    }

    state.currentLEDStatus = newCurrentLEDStatus;
  },

  startEditingLED: (state: State) => {
    const currentLEDEffect = state.currentLEDEffect;
    if (currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }

    state.editingData = {
      start: currentLEDEffect.effects[state.currentLEDIndex].start,
      frameId: state.currentLEDIndex.toString(),
      index: state.currentLEDIndex,
    };
  },

  addFrameToCurrentLEDEffect: (state: State) => {
    if (state.currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }
    if (state.currentLEDPartName === null) {
      throw new Error("No current LED part");
    }
    const newCurrentLEDEffect = cloneDeep(state.currentLEDEffect);
    const LEDPartName = state.currentLEDPartName;
    const dancerName = getDancerFromLEDpart(LEDPartName);

    const { effect } = state.currentLEDStatus[dancerName][LEDPartName];
    const start = state.currentTime - state.currentLEDEffectStart;
    // check if there is already a frame at the same time
    const index = binarySearchObjects(
      newCurrentLEDEffect.effects,
      start,
      (effect) => effect.start
    );

    if (newCurrentLEDEffect.effects[index]?.start === start) {
      throw new Error("There is already a frame at the same time");
    }

    newCurrentLEDEffect.effects.push({
      start,
      fade: state.currentFade,
      effect,
    });
    newCurrentLEDEffect.effects.sort((a, b) => a.start - b.start);
    state.currentLEDEffect = newCurrentLEDEffect;

    setCurrentTime({ payload: state.currentTime });
  },

  // payload is the index of the frame to be deleted
  deleteCurrentFrameFromCurrentLEDEffect: (state: State) => {
    if (state.currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }
    const newCurrentLEDEffect = cloneDeep(state.currentLEDEffect);
    newCurrentLEDEffect.effects.splice(state.currentLEDIndex, 1);
    state.currentLEDEffect = newCurrentLEDEffect;

    setCurrentTime({ payload: state.currentTime });
  },

  // payload is whether we should modify the time of the frame
  saveCurrentLEDEffectFrame: (state: State, payload: boolean) => {
    if (state.currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }
    if (state.currentLEDPartName === null) {
      throw new Error("No current LED part");
    }
    const newCurrentLEDEffect = cloneDeep(state.currentLEDEffect);
    const LEDPartName = state.currentLEDPartName;
    const dancerName = getDancerFromLEDpart(LEDPartName);

    const { effect } = state.currentLEDStatus[dancerName][LEDPartName];

    const start = payload
      ? state.currentTime - state.currentLEDEffectStart
      : newCurrentLEDEffect.effects[state.currentLEDIndex].start;

    newCurrentLEDEffect.effects[state.currentLEDIndex] = {
      start,
      fade: state.currentFade,
      effect,
    };
    newCurrentLEDEffect.effects.sort((a, b) => a.start - b.start);
    state.currentLEDEffect = newCurrentLEDEffect;

    cancelEditMode();
  },

  setupLEDEditor: async (
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
    state.selectionMode = "LED_MODE";
    const partLength = state.LEDPartLengthMap[partName];
    state.currentLEDEffect = {
      repeat: 1,
      effects: [createEmptyLEDEffectFrame(partLength)],
    };
    await initCurrentLEDStatus();
  },

  exitLEDEditor: (state: State) => {
    state.currentLEDEffectName = null;
    state.currentLEDPartName = null;
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

    const index = updateFrameByTimeMap(
      controlRecord,
      controlMap,
      state.currentLEDIndex,
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

    state.currentLEDStatus = updateCurrentLEDStatus(
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
            (part as LEDData).effectID !== NO_EFFECT
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
  startEditingLED,
  editCurrentLEDStatus,
  setLEDMap,
  syncLEDEffectRecord,
  syncCurrentLEDStatus,
  addFrameToCurrentLEDEffect,
  deleteCurrentFrameFromCurrentLEDEffect,
  saveCurrentLEDEffectFrame,
  setupLEDEditor,
  exitLEDEditor,
} = actions;
