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
  updateLedEffect,
} from "../utils";
// types
import type { State } from "../models";
// constants
import { IDLE } from "@/constants";
import { syncCurrentStatusWithControlMap } from "./currentStatus";
import { syncCurrentPosWithPosMap } from "./currentPos";

import { log } from "@/core/utils";

const actions = registerActions({
  /**
   * calculate the currentStatus, currentPos according to the time
   * It will do fade or position interpolation
   * @param {State} statue
   * @param {object} payload
   */
  setCurrentTime: async (state: State, payload: number) => {
    const [controlMap, controlRecord] = await getControl();
    const [posMap, posRecord] = await getPos();
    const ledMap = await getLedMap();

    let time = payload;
    if (isNaN(time)) {
      throw new Error(`[Error] setTime invalid parameter(time ${time})`);
    }
    time = Math.max(time, 0);

    state.currentTime = time;

    // only set the time if not IDLE
    if (state.editMode !== IDLE) return;

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

    state.currentLEDStatus = updateLedEffect(
      controlMap,
      state.ledEffectRecord,
      state.currentLEDStatus,
      ledMap,
      time
    );
  },

  /**
   * set currentControlIndex by controlIndex, also set currentStatus
   * call setCurrentTime to calculate new status and pos, including fade and interpolation
   * @param {State} state
   * @param {object} payload
   */
  setCurrentControlIndex: async (state: State, payload: number) => {
    log("setCurrentControlIndex", payload);
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
    state.statusStack = [];
    state.statusStackIndex = -1;
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
});

export const { setCurrentTime, setCurrentControlIndex, setCurrentPosIndex } =
  actions;
