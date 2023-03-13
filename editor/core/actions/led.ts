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
  LEDEffectIDtable,
  CurrentLEDStatus,
} from "../models";
import { isLEDPartName } from "../models";
// utils
import {
  binarySearchObjects,
  createBlack,
  createEmptyLEDEffectFrame,
  getControl,
  getDancerFromLEDpart,
  notification,
  updateFrameByTimeMap,
} from "../utils";
import { NEW_EFFECT, NO_EFFECT } from "@/constants";
import { getLedMap } from "../utils";
import { updateCurrentLEDStatus } from "../utils";
import { ControlMap } from "../models";
import { ControlRecord } from "../models";
import { PartTypeMap } from "../models";
import { Dancers } from "../models";
import { setCurrentTime } from "./timeData";
import { ledAgent } from "@/api";
import { toLEDEffectFramePayload } from "../utils/convert";

const actions = registerActions({
  setLEDMap: async (state: State, payload: LEDMap) => {
    state.ledMap = payload;
  },

  setLEDEffectIDtable: async (state: State, payload: LEDEffectIDtable) => {
    state.LEDEffectIDtable = payload;
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
        console.log({ key, value, dancerName, partName, bulbIndex });
        // @ts-expect-error the key is guaranteed to be in the type
        newCurrentLEDStatus[dancerName][partName].effect[bulbIndex][key] =
          value;
      }
    }

    state.currentLEDStatus = newCurrentLEDStatus;
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
  saveCurrentLEDEffectFrame: (state: State) => {
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

    const start = newCurrentLEDEffect.effects[state.currentLEDIndex].start;

    newCurrentLEDEffect.effects[state.currentLEDIndex] = {
      start,
      fade: state.currentFade,
      effect,
    };
    newCurrentLEDEffect.effects.sort((a, b) => a.start - b.start);
    state.currentLEDEffect = newCurrentLEDEffect;
  },

  updateLEDEffectFrameTime: (
    state: State,
    payload: {
      frameIndex: number;
      time: number;
    }
  ) => {
    if (state.currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }
    const { frameIndex, time } = payload;
    const newCurrentLEDEffect = cloneDeep(state.currentLEDEffect);
    newCurrentLEDEffect.effects[frameIndex].start = time;
    newCurrentLEDEffect.effects.sort((a, b) => a.start - b.start);
    state.currentLEDEffect = newCurrentLEDEffect;
  },

  saveLEDEffect: async (state: State) => {
    if (state.currentLEDEffect === null) {
      throw new Error("No current LED effect");
    }
    if (state.currentLEDPartName === null) {
      throw new Error("No current LED part");
    }
    if (state.currentLEDEffectName === null) {
      throw new Error("No current LED effect name");
    }

    const frames = state.currentLEDEffect.effects.map(toLEDEffectFramePayload);

    const effectID =
      state.ledMap[state.currentLEDPartName][state.currentLEDEffectName]
        ?.effectID;

    try {
      if (effectID !== undefined) {
        await ledAgent.saveLEDEffect({
          id: effectID,
          frames,
          name: state.currentLEDEffectName,
          repeat: state.currentLEDEffect.repeat,
        });
        notification.success("LED Effect saved");
      } else {
        await ledAgent.addLEDEffect({
          frames,
          name: state.currentLEDEffectName,
          partName: state.currentLEDPartName,
          repeat: state.currentLEDEffect.repeat,
        });
        notification.success("LED Effect created");
      }
    } catch (error) {
      if (error instanceof Error) {
        notification.error(error.message);
      }
      console.error(error);
    }
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
    state.editor = "LED_EDITOR";
    state.editorState = "EDITING";
    const partLength = state.LEDPartLengthMap[partName];

    const effectID = state.ledMap[partName][effectName]?.effectID;

    if (effectID === undefined) {
      state.currentLEDEffect = {
        name: effectName,
        effectID: NEW_EFFECT,
        repeat: 1,
        effects: [createEmptyLEDEffectFrame(partLength)],
      };
    } else {
      const effect = state.LEDEffectIDtable[effectID];
      state.currentLEDEffect = cloneDeep(effect);
    }

    const { dancers, LEDPartLengthMap } = state;
    const blackColorID = await createBlack();
    const newLEDStatus: CurrentLEDStatus = {};
    Object.entries(dancers).map(([dancerName, parts]) => {
      newLEDStatus[dancerName] = {};
      parts.forEach((part) => {
        if (isLEDPartName(part)) {
          const length = LEDPartLengthMap[part];
          newLEDStatus[dancerName][part] = {
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
    const dancerName = getDancerFromLEDpart(partName);
    newLEDStatus[dancerName][partName].effect =
      state.currentLEDEffect.effects[0].effect;
    state.currentLEDStatus = newLEDStatus;
  },

  cancelEditLEDEffect: (state: State) => {
    state.currentLEDEffectName = null;
    state.currentLEDPartName = null;
    state.currentLEDEffectStart = 0;
    state.currentLEDEffect = null;
    state.editorState = "IDLE";
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [ledMap, ledEffectIDtable] = await getLedMap();

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

    const pseudoLEDEffectRecord: LEDEffectRecord =
      await generateLEDEffectRecord(
        pseudoControlMap,
        controlRecord,
        state.dancers,
        state.partTypeMap
      );

    state.currentLEDStatus = updateCurrentLEDStatus(
      pseudoControlMap,
      pseudoLEDEffectRecord,
      state.currentLEDStatus,
      ledEffectIDtable,
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
  controlRecord.forEach((id: number) => {
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
  setLEDMap,
  setLEDEffectIDtable,
  setCurrentLEDPartName,
  setCurrentLEDEffectName,
  setCurrentLEDEffect,
  setCurrentLEDEffectRepeat,
  editCurrentLEDStatus,
  syncLEDEffectRecord,
  syncCurrentLEDStatus,
  addFrameToCurrentLEDEffect,
  deleteCurrentFrameFromCurrentLEDEffect,
  saveCurrentLEDEffectFrame,
  saveLEDEffect,
  updateLEDEffectFrameTime,
  setupLEDEditor,
  cancelEditLEDEffect,
} = actions;
