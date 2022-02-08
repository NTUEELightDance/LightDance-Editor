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
  setTime: async (state: State, payload: { from: string; time: number }) => {
    const [controlMap, controlRecord] = await getControl();
    const [posMap, posRecord] = await getPos();

    let { from, time } = payload;
    if (from === undefined || time === undefined) {
      throw new Error(
        `[Error] setTime invalid parameter(from ${from}, time ${time})`
      );
    }
    if (isNaN(time)) return;
    time = Math.max(time, 0);

    state.timeData.from = from;
    state.timeData.time = time;

    // set timeData.controlFrame and currentStatus
    const newControlFrame = updateFrameByTimeMap(
      controlRecord,
      controlMap,
      state.timeData.controlFrame,
      time
    );
    state.timeData.controlFrame = newControlFrame;
    // status fade
    if (newControlFrame === controlRecord.length - 1) {
      // Can't fade
      state.currentStatus = controlMap[controlRecord[newControlFrame]].status;
    } else {
      // do fade
      state.currentStatus = fadeStatus(
        time,
        controlMap[controlRecord[newControlFrame]],
        controlMap[controlRecord[newControlFrame + 1]]
      );
    }

    // set timeData.posFrame and currentPos
    const newPosFrame = updateFrameByTimeMap(
      posRecord,
      posMap,
      state.timeData.posFrame,
      time
    );
    state.timeData.posFrame = newPosFrame;
    // position interpolation
    if (newPosFrame === posRecord.length - 1) {
      // can't interpolation
      state.currentPos = posMap[posRecord[newPosFrame]].pos;
    } else {
      // do interpolation
      state.currentPos = interpolationPos(
        time,
        posMap[posRecord[newPosFrame]],
        posMap[posRecord[newPosFrame + 1]]
      );
    }

    // set currentFade
    state.currentFade = controlMap[controlRecord[newControlFrame]].fade;
  },

  /**
   * set timeData by controlFrame, also set currentStatus
   * @param {State} state
   * @param {object} payload
   */
  setControlFrame: async (
    state: State,
    payload: {
      from: string;
      controlFrame: number;
    }
  ) => {
    const [controlMap, controlRecord] = await getControl();
    const [posMap, posRecord] = await getPos();
    let { from, controlFrame } = payload;
    if (from === undefined || controlFrame === undefined) {
      throw new Error(
        `[Error] setControlFrame invalid parameter(from ${from}, controlFrame ${controlFrame})`
      );
    }
    if (isNaN(controlFrame)) return;
    controlFrame = clamp(controlFrame, 0, controlRecord.length - 1);
    state.timeData.from = from;
    state.timeData.controlFrame = controlFrame;
    state.timeData.time = controlMap[controlRecord[controlFrame]].start;
    state.currentStatus = controlMap[controlRecord[controlFrame]].status;
    // set posFrame and currentPos as well (by time)
    const newPosFrame = updateFrameByTimeMap(
      posRecord,
      posMap,
      state.timeData.posFrame,
      controlMap[controlRecord[controlFrame]].start
    );
    state.timeData.posFrame = newPosFrame;
    state.currentPos = posMap[posRecord[newPosFrame]].pos;
    // set currentFade
    state.currentFade = controlMap[controlRecord[controlFrame]].fade;
  },

  /**
   * set timeData by posFrame, also set currentPos
   * @param {State} state
   * @param {object} payload
   */
  setPosFrame: async (
    state: State,
    payload: { from: string; posFrame: number }
  ) => {
    const [controlMap, controlRecord] = await getControl();
    const [posMap, posRecord] = await getPos();
    let { from, posFrame } = payload;
    if (from === undefined || posFrame === undefined) {
      throw new Error(
        `[Error] setPosFrame invalid parameter(from ${from}, posFrame ${posFrame})`
      );
    }
    if (isNaN(posFrame)) return;
    posFrame = clamp(posFrame, 0, posRecord.length - 1);
    state.timeData.from = from;
    state.timeData.posFrame = posFrame;
    state.timeData.time = posMap[posRecord[posFrame]].start;
    state.currentPos = posMap[posRecord[posFrame]].pos;
    // set controlFrame and currentStatus as well (by time)
    const newControlFrame = updateFrameByTimeMap(
      controlRecord,
      controlMap,
      state.timeData.controlFrame,
      posMap[posRecord[posFrame]].start
    );
    state.timeData.controlFrame = newControlFrame;
    state.currentStatus = controlMap[controlRecord[newControlFrame]].status;
    // set currentFade
    state.currentFade = controlMap[controlRecord[newControlFrame]].fade;
  },
});

export const { setTime, setControlFrame, setPosFrame } = actions;
