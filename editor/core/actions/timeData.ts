import { registerActions } from "../registerActions";
// utils
import {
  getControl,
  getPos,
  clamp,
  updateFrameByTimeMap,
  interpolationPos,
  fadeStatus,
} from "../utils";
// types
import { State } from "../models";

const actions = registerActions({
  /**
   * calculate the currentStatus, currentPos according to the time
   * @param {State} statue
   * @param {object} payload
   */
  setCurrentTime: async (state: State, payload: number) => {
    const [controlMap, controlRecord] = await getControl();
    const [posMap, posRecord] = await getPos();

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
        controlMap[controlRecord[newControlIndex + 1]]
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
  },

  /**
   * set currentControlIndex by controlIndex, also set currentStatus
   * @param {State} state
   * @param {object} payload
   */
  setCurrentControlIndex: async (state: State, payload: number) => {
    const [controlMap, controlRecord] = await getControl();
    const [posMap, posRecord] = await getPos();
    let controlIndex = payload;
    if (isNaN(controlIndex)) {
      throw new Error(
        `[Error] setCurrentControlIndex invalid parameter(controlIndex ${controlIndex})`
      );
    }
    controlIndex = clamp(controlIndex, 0, controlRecord.length - 1);
    state.currentControlIndex = controlIndex;
    state.currentTime = controlMap[controlRecord[controlIndex]].start;
    state.currentStatus = controlMap[controlRecord[controlIndex]].status;
    // set posIndex and currentPos as well (by time)
    const newPosIndex = updateFrameByTimeMap(
      posRecord,
      posMap,
      state.currentPosIndex,
      controlMap[controlRecord[controlIndex]].start
    );
    state.currentPosIndex = newPosIndex;
    state.currentPos = posMap[posRecord[newPosIndex]].pos;
    // set currentFade
    state.currentFade = controlMap[controlRecord[controlIndex]].fade;
  },

  /**
   * set currentPosIndex by posIndex, also set currentPos
   * @param {State} state
   * @param {object} payload
   */
  setCurrentPosIndex: async (state: State, payload: number) => {
    const [controlMap, controlRecord] = await getControl();
    const [posMap, posRecord] = await getPos();
    let posIndex = payload;
    if (isNaN(posIndex)) {
      throw new Error(
        `[Error] setCurrentPosIndex invalid parameter(posIndex ${posIndex})`
      );
    }
    posIndex = clamp(posIndex, 0, posRecord.length - 1);
    state.currentPosIndex = posIndex;
    state.currentTime = posMap[posRecord[posIndex]].start;
    state.currentPos = posMap[posRecord[posIndex]].pos;
    // set controlIndex and currentStatus as well (by time)
    const newControlIndex = updateFrameByTimeMap(
      controlRecord,
      controlMap,
      state.currentControlIndex,
      posMap[posRecord[posIndex]].start
    );
    state.currentControlIndex = newControlIndex;
    state.currentStatus = controlMap[controlRecord[newControlIndex]].status;
    // set currentFade
    state.currentFade = controlMap[controlRecord[newControlIndex]].fade;
  },
});

export const { setCurrentTime, setCurrentControlIndex, setCurrentPosIndex } =
  actions;
