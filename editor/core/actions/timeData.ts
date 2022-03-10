import { registerActions } from "../registerActions";
// utils
import {
  getControl,
  getPos,
  getLedMap,
  clamp,
  updateFrameByTimeMap,
  interpolationPos,
  fadeStatus,
  updateLedEffect,
} from "../utils";
// types
import { State } from "../models";

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

    // set currentControlIndex
    const newControlIndex = updateFrameByTimeMap(
      controlRecord,
      controlMap,
      state.currentControlIndex,
      time
    );

    state.currentControlIndex = newControlIndex;
    // status fade
    if (newControlIndex === controlRecord.length - 1) {
      // Can't fade
      state.currentStatus = controlMap[controlRecord[newControlIndex]].status;
    } else {
      // do fade
      state.currentStatus = fadeStatus(
        time,
        controlMap[controlRecord[newControlIndex]],
        controlMap[controlRecord[newControlIndex + 1]],
        state.colorMap
      );
    }

    // set currentPosIndex
    const newPosIndex = updateFrameByTimeMap(
      posRecord,
      posMap,
      state.currentPosIndex,
      time
    );
    state.currentPosIndex = newPosIndex;
    // position interpolation
    if (newPosIndex === posRecord.length - 1) {
      // can't interpolation
      state.currentPos = posMap[posRecord[newPosIndex]].pos;
    } else {
      // do interpolation
      state.currentPos = interpolationPos(
        time,
        posMap[posRecord[newPosIndex]],
        posMap[posRecord[newPosIndex + 1]]
      );
    }

    // set currentFade
    state.currentFade = controlMap[controlRecord[newControlIndex]].fade;

    // update currentLedEffectIndexMap
    state.currentLedEffect = updateLedEffect(
      controlMap,
      state.ledEffectRecord,
      state.currentLedEffect,
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
    const [controlMap, controlRecord] = await getControl();
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
    const [posMap, posRecord] = await getPos();
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
