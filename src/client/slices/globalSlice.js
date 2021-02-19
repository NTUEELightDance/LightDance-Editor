/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
// constants

// utils
import { clamp, updateFrameByTime } from "../utils/math";

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    isPlaying: false, // isPlaying
    selected: [], // array of selected dancer's name

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

    mode: 0, // 0: nothing, 1: edit, 2: add
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
     * Initiate controlRecord and currentStatus
     * @param {*} state - redux state
     * @param {array} action.payload - controlRecord
     */
    controlInit: (state, action) => {
      const controlRecord = action.payload;
      if (controlRecord.length === 0)
        throw new Error(`[Error] controlInit, controlRecord is empty `);
      state.controlRecord = controlRecord;
      state.currentStatus = controlRecord[0].status;
    },

    /**
     * Initiate posRecord and currentPos
     * @param {*} state
     * @param {object} action.payload - posRecord
     */
    posInit: (state, action) => {
      const posRecord = action.payload;
      if (posRecord.length === 0)
        throw new Error(`[Error] posInit, posRecord is empty `);
      state.posRecord = posRecord;
      state.currentPos = posRecord[0].pos;
    },

    /**
     * Set selected array
     * @param {*} state
     * @param {array of number} action.payload - array of dancer's name
     */
    setSelected: (state, action) => {
      state.selected = action.payload;
    },

    /**
     * toggle one in selected array
     * @param {*} state
     * @param {string} action.payload - one of dancer's name
     */
    toggleSelected: (state, action) => {
      const name = action.payload;
      if (state.selected.includes(name)) {
        // delete the name
        state.selected = state.selected.filter((n) => n !== name);
      } else state.selected.push(name);
    },

    /**
     * Set current Frame
     * @param {*} state
     * @param {object} action.payload - new status object
     */
    setCurrentStatus: (state, action) => {
      // const { id, status } = action.payload;
      // state.currentStatus[`player${id}`] = status;
    },

    /**
     * Set current pos
     * @param {*} state
     * @param {object} action.payload - new pos
     */
    setCurrentPos: (state, action) => {
      const { name, x, y, z } = action.payload;
      if (!state.currentPos[name])
        throw new Error(
          `[Error] setCurrentPos, invalid parameter(name), ${name}`
        );
      if (
        typeof x !== "number" ||
        typeof y !== "number" ||
        typeof z !== "number"
      )
        throw new Error(
          `[Error] setCurrentPos, invalid parameter(x, y, z) ${x}, ${y}, ${z}`
        );
      state.currentPos[name] = { x, y, z };
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
      let { from, time } = action.payload;
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
      const newControlFrame = updateFrameByTime(
        state.controlRecord,
        state.timeData.controlFrame,
        time
      );
      state.timeData.controlFrame = newControlFrame;
      state.currentStatus = state.controlRecord[newControlFrame].status;
      // set timeData.posFrame and currentPos
      const newPosFrame = updateFrameByTime(
        state.posRecord,
        state.timeData.posFrame,
        time
      );
      state.timeData.posFrame = newPosFrame;
      // TODO: interpolation
      state.currentPos = state.posRecord[newPosFrame].pos;
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
      if (isNaN(controlFrame)) return;
      controlFrame = clamp(controlFrame, 0, state.controlRecord.length - 1);
      state.timeData.from = from;
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
      let { from, posFrame } = action.payload;
      if (from === undefined || posFrame === undefined) {
        throw new Error(
          `[Error] setPosFrame invalid parameter(from ${from}, posFrame ${posFrame})`
        );
      }
      if (isNaN(posFrame)) return;
      posFrame = clamp(posFrame, 0, state.posRecord.length - 1);
      state.timeData.from = from;
      state.timeData.posFrame = posFrame;
      state.timeData.time = state.posRecord[posFrame].start;
      state.currentPos = state.posRecord[posFrame].pos;
    },

    /**
     * set editor mode, 0: IDLE, 1: EDIT, 2: ADD
     * @param {*} state
     * @param {number} action.payload - new mode
     */
    setMode: (state, action) => {
      state.mode = action.payload;
      console.log(`setMode, ${action.payload}`);
    },
  },
});

export const {
  playPause,
  posInit,
  controlInit,
  setSelected,
  toggleSelected,

  setCurrentStatus,
  setCurrentPos,
  setNewPosRecord,

  setTime,
  setPosFrame,
  setControlFrame,

  setMode,
} = globalSlice.actions;

export const selectGlobal = (state) => state.global;

export default globalSlice.reducer;
