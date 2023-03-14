import { registerActions } from "../registerActions";
// utils
import {
  getControlPayload,
  getPosPayload,
  getControl,
  getPos,
  getLedMap,
  clamp,
  updateFrameByTimeMap,
  updateCurrentLEDStatus,
  binarySearchObjects,
  createEmptyLEDEffectFrame,
} from "../utils";
// types
import type {
  ControlMap,
  CurrentLEDStatus,
  LEDEffectRecord,
  State,
} from "../models";

import { syncCurrentStatusWithControlMap } from "./currentStatus";
import { syncCurrentPosWithPosMap } from "./currentPos";
import { NEW_EFFECT } from "@/constants";

const actions = registerActions({
  setCurrentTime: async (state: State, payload: number) => {
    const [controlMap, controlRecord] = await getControl();
    const [posMap, posRecord] = await getPos();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, ledEffectIDtable] = await getLedMap();

    let time = payload;
    if (isNaN(time)) {
      throw new Error(`[Error] setTime invalid parameter(time ${time})`);
    }
    time = Math.max(time, 0);

    state.currentTime = time;

    // set currentControlIndex
    const newControlIndex = updateFrameByTimeMap(
      controlRecord,
      controlMap,
      state.currentControlIndex,
      time
    );

    state.currentControlIndex = newControlIndex;
    await syncCurrentStatusWithControlMap({
      options: {
        rerender: false,
        refreshThreeSimulator: false,
        refreshWavesurfer: false,
      },
    });

    // set currentFade
    state.currentFade = controlMap[controlRecord[newControlIndex]].fade;

    // set currentPosIndex
    const newPosIndex = updateFrameByTimeMap(
      posRecord,
      posMap,
      state.currentPosIndex,
      time
    );
    state.currentPosIndex = newPosIndex;
    await syncCurrentPosWithPosMap({
      options: {
        rerender: false,
        refreshThreeSimulator: false,
        refreshWavesurfer: false,
      },
    });

    const newCurrentLEDStatus = updateCurrentLEDStatus(
      controlMap,
      state.ledEffectRecord,
      state.currentLEDStatus,
      ledEffectIDtable,
      time
    );

    // calculate the focused LED part's status from current LED effect
    if (state.editor === "LED_EDITOR") {
      const currentLEDPartName = state.currentLEDPartName;
      const referenceDancerName = state.currentLEDEffectReferenceDancer;
      const currentLEDEffectName = state.currentLEDEffectName;
      const currentLEDEffect = state.currentLEDEffect;

      if (currentLEDPartName === null) return;
      if (referenceDancerName === null) return;
      if (currentLEDEffectName === null) return;
      if (currentLEDEffect === null) return;

      const frameID = 0;
      const pseudoControlMap: ControlMap = {
        [frameID]: {
          start: state.currentLEDEffectStart,
          fade: false,
          status: {
            [referenceDancerName]: {
              [currentLEDPartName]: {
                alpha: 10,
                effectID: currentLEDEffect.effectID,
              },
            },
          },
        },
      };

      const pseudoLEDStatus: CurrentLEDStatus = {
        [referenceDancerName]: {
          [currentLEDPartName]:
            state.currentLEDStatus[referenceDancerName][currentLEDPartName],
        },
      };

      const pseudoLEDRecord: LEDEffectRecord = {
        [referenceDancerName]: {
          [currentLEDPartName]: [frameID],
        },
      };

      const pseudoEffectIDtable = {
        [NEW_EFFECT]: {
          ...state.LEDEffectIDtable[NEW_EFFECT],
          effects: [
            createEmptyLEDEffectFrame(
              state.LEDPartLengthMap[currentLEDPartName]
            ),
          ],
        },
        [currentLEDEffect.effectID]: currentLEDEffect,
      };

      const focusedLEDStatus = updateCurrentLEDStatus(
        pseudoControlMap,
        pseudoLEDRecord,
        pseudoLEDStatus,
        pseudoEffectIDtable,
        time
      );

      newCurrentLEDStatus[referenceDancerName][currentLEDPartName] =
        focusedLEDStatus[referenceDancerName][currentLEDPartName];

      state.currentLEDIndex = binarySearchObjects(
        currentLEDEffect.effects,
        time,
        (effect) => effect.start
      );
    }

    state.currentLEDStatus = newCurrentLEDStatus;
  },

  /**
   * set currentControlIndex by controlIndex, also set currentStatus
   * call setCurrentTime to calculate new status and pos, including fade and interpolation
   * @param {State} state
   * @param {object} payload
   */
  setCurrentControlIndex: async (state: State, payload: number) => {
    const [controlMap, controlRecord] = await getControlPayload();
    let controlIndex = payload;
    if (isNaN(controlIndex)) {
      throw new Error(
        `[Error] setCurrentControlIndex invalid parameter(controlIndex ${controlIndex})`
      );
    }
    controlIndex = clamp(controlIndex, 0, controlRecord.length - 1);
    const newTime = controlMap[controlRecord[controlIndex]].start;
    setCurrentTime({ payload: newTime });
  },

  /**
   * set currentPosIndex by posIndex
   * call setCurrentTime to calculate new status and pos, including fade and interpolation
   * @param {State} state
   * @param {object} payload
   */
  setCurrentPosIndex: async (state: State, payload: number) => {
    const [posMap, posRecord] = await getPosPayload();
    let posIndex = payload;
    if (isNaN(posIndex)) {
      throw new Error(
        `[Error] setCurrentPosIndex invalid parameter(posIndex ${posIndex})`
      );
    }
    posIndex = clamp(posIndex, 0, posRecord.length - 1);
    const newTime = posMap[posRecord[posIndex]].start;
    setCurrentTime({ payload: newTime });
  },

  setCurrentLEDIndex: async (state: State, payload: number) => {
    if (state.currentLEDEffect === null) {
      throw new Error("currentLEDEffect is null");
    }
    const frames = state.currentLEDEffect.effects.map((effect) => effect.start);
    const index = clamp(payload, 0, frames.length - 1);
    setCurrentTime({ payload: frames[index] + state.currentLEDEffectStart });
  },
});

export const {
  setCurrentTime,
  setCurrentControlIndex,
  setCurrentPosIndex,
  setCurrentLEDIndex,
} = actions;
