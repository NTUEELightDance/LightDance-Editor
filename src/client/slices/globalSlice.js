/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
// constants

// utils
import { clamp, updateFrameByTime } from "../utils/math";

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    isPlaying: false, // isPlaying
    selected: [], // dancer selected

    currentStatus: {}, // current dancers' status
    currentPos: {}, // currnet dancers' position

    controlRecord: [], // array of all dancer's status
    posRecord: {}, // array of all dancer's pos

    timeData: {
      from: "", // update from what component
      time: 0, // time
      controlFrame: 0, // control frame's index
      posFrame: 0, // positions' index
    },
  },
  reducers: {
    /**
     * Play or Pause
     * @param {*} state - redux state
     * @param {boolean} action.payload
     */
    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },

    /**
     * Initiate controlRecord
     * @param {*} state - redux state
     * @param {array} action.payload - controlRecord
     */
    controlInit: (state, action) => {
      const controlRecord = action.payload;
      if (controlRecord.length === 0)
        throw new Error(`[Error] controlInit, controlRecord is empty `);
      state.controlRecord = controlRecord;
      // initailize currentStatus
      state.currentStatus = controlRecord[0].status;
    },

    /**
     * Initiate posRecord
     * @param {*} state
     * @param {object} action.payload - posRecord
     */
    posInit: (state, action) => {
      state.posRecord = action.payload;
    },

    // /**
    //  * Update Time data
    //  * @param {*} state
    //  * @param {object} action.payload -  {time, controlFrame, postFrame, from: string}
    //  */
    // updateTimeData: (state, action) => {
    //   const { time: newTime } = action.payload;
    //   let {
    //     controlFrame: newControlFrame,
    //     posFram: newPosFrame, // ?????? posFrame?
    //   } = action.payload;
    //   if (!newControlFrame || !newPosFrame) {
    //     const { posFrame, controlFrame } = state.timeData;
    //     newControlFrame = updateFrameByTime(
    //       state.controlRecord,
    //       controlFrame,
    //       newTime
    //     );
    //     newPosFrame = updateFrameByTime(state.posRecord, posFrame, newTime);
    //   }
    //   state.timeData.controlFrame = newControlFrame;
    //   state.timeData.posFrame = newPosFrame;
    //   state.timeData.time = newTime;
    // },

    /**
     * Set selected array
     * @param {*} state
     * @param {array of number} action.payload - new selected array
     */
    setSelected: (state, action) => {
      state.selected = action.payload;
    },

    /**
     * Set current Frame
     * @param {*} state
     * @param {object} action.payload - new frame object
     */
    setCurrentStatus: (state, action) => {
      const { id, status } = action.payload;
      state.currentStatus[`player${id}`] = status;
    },

    /**
     * Set current pos
     * @param {*} state
     * @param {object} action.payload - new pos
     */
    setCurrentPos: (state, action) => {
      // const { id, x, y, z } = action.payload;
      // state.currentPos[`player${id}`] = { x, y, z };
    },

    /**
     *
     * @param {*} state
     */
    setNewPosRecord: (state) => {
      // // can't save while playing
      // if (state.isPlaying) return;
      // const { time: curTime, posFrame } = state.timeData;
      // Object.keys(state.currentPos).forEach((curName) => {
      //   const posData = state.currentPos[curName];
      //   let { x, y, z } = posData;
      //   [x, y, z] = [x, y, z].map((ele) => Math.round(ele * 1000) / 1000);
      //   const newPosFrame = { Start: curTime, x, y, z };
      //   const cloestPosFrame = updateFrameByTime(
      //     state.posRecord,
      //     posFrame,
      //     curTime
      //   );
      //   state.timeData.posFrame = cloestPosFrame;
      //   if (state.posRecord[curName]) {
      //     if (state.posRecord["player0"][cloestPosFrame].Start === curTime) {
      //       state.posRecord[curName][cloestPosFrame] = newPosFrame;
      //     } else {
      //       state.posRecord[curName].splice(cloestPosFrame + 1, 0, newPosFrame);
      //     }
      //   } else {
      //     state.posRecord[curName] = [newPosFrame];
      //   }
      // });
    },

    /**
     * set timeData by time, also set currentStatus and currentPos
     * @param {} state
     * @param {*} action.payload - number
     */
    setTime: (state, action) => {
      const { from, time } = action.payload;
      if (from === undefined || time === undefined) {
        throw new Error(
          `[Error] setTime invalid parameter(from ${from}, time ${time})`
        );
      }
      if (typeof time !== "number") return;
      state.timeData.from = from;
      state.timeData.time = Math.max(time, 0);
      // change timeData.controlFrame and currentStatus
      const newControlFrame = updateFrameByTime(
        state.controlRecord,
        state.timeData.controlFrame,
        time
      );
      // change timeData.controlFrame and currentStatus
      state.timeData.controlFrame = newControlFrame;
      state.currentStatus = state.controlRecord[newControlFrame].status;
      // change timeData.posFrame and currentPos
      // TODO
    },

    /**
     * set timeData by controlFrame, also set currentStatus
     * @param {} state
     * @param {*} action.payload - number
     */
    setControlFrame: (state, action) => {
      let { from, controlFrame } = action.payload;
      if (from === undefined || controlFrame === undefined) {
        throw new Error(
          `[Error] setControlFrame invalid parameter(from ${from}, controlFrame ${controlFrame})`
        );
      }
      if (typeof controlFrame !== "number") return;

      state.timeData.from = from;
      controlFrame = clamp(controlFrame, 0, state.controlRecord.length); //
      state.timeData.controlFrame = controlFrame;
      state.timeData.time = state.controlRecord[controlFrame].start;
      state.currentStatus = state.controlRecord[controlFrame].status;
    },

    /**
     * set timeData by posFrame, also set currentPos
     * @param {} state
     * @param {*} action.payload - number
     */
    setPosFrame: (state, action) => {
      const { from, posFrame } = action.payload;
      if (from === undefined || posFrame === undefined) {
        throw new Error(
          `[Error] setPosFrame invalid parameter(from ${from}, posFrame ${posFrame})`
        );
      }
      if (typeof posFrame !== "number") return;

      state.timeData.from = from;
      state.timeData.posFrame = posFrame >= 0 ? posFrame : 0;
      // TODO: change time by posRecord as well
    },
  },
});

export const {
  playPause,
  posInit,
  controlInit,
  // updateTimeData,
  setSelected,
  setCurrentStatus,
  setCurrentPos,
  setNewPosRecord,

  setTime,
  setPosFrame,
  setControlFrame,
} = globalSlice.actions;

export const selectGlobal = (state) => state.global;

export default globalSlice.reducer;
