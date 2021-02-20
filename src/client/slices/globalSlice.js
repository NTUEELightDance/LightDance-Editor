/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
// constants
import { IDLE, EDIT, ADD } from "../constants";

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
    posRecord: [], // array of all dancer's pos

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
     * Edit current Status
     * @param {} state
     * @param {*} action.payload - { dancerName, partName, value}
     */
    editCurrentStatus: (state, action) => {
      const { dancerName, partName, value } = action.payload;
      state.currentStatus[dancerName][partName] = value;
    },

    /**
     * Save currentStatus, according to controlFrame and mode
     * @param {*} state
     */
    saveCurrentStatus: (state) => {
      if (state.mode === EDIT) {
        state.controlRecord[state.timeData.controlFrame].status =
          state.currentStatus;
      } else if (state.mode === ADD) {
        state.controlRecord.splice(state.timeData.controlFrame + 1, 1, {
          start: state.timeData.time,
          status: state.currentStatus,
        });
      }
      state.mode = IDLE;
    },

    /**
     * Delete currentStatus, according to controlFrame
     * @param {*} state
     */
    deleteCurrentStatus: (state) => {
      if (state.mode !== IDLE) {
        console.error(`Can't Delete in EDIT or IDLE Mode`);
        return;
      }
      if (state.timeData.controlFrame === 0) {
        console.error(`Can't Delete Frame 0`);
        return;
      }
      state.controlRecord.splice(state.timeData.controlFrame, 1);
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
     * Save currentPos to posRecord
     * @param {*} state
     */
    saveCurrentPos: (state) => {
      if (state.mode === EDIT) {
        state.posRecord[state.timeData.posFrame].pos = state.currentPos;
      } else if (state.mode === ADD) {
        state.posRecord.splice(state.timeData.posFrame + 1, 1, {
          start: state.timeData.time,
          pos: state.currentPos,
        });
      }
      state.mode = IDLE;
    },

    /**
     * Delete current pos
     * @param {*} state
     */
    deleteCurrentPos: (state) => {
      if (state.mode !== IDLE) {
        console.error(`Can't Delete in EDIT or IDLE Mode`);
        return;
      }
      if (state.timeData.posFrame === 0) {
        console.error(`Can't Delete Frame 0`);
        return;
      }
      state.posRecord.splice(state.timeData.posFrame, 1);
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
    },

    /**
     * toggle editor mode, 0: IDLE, 1: EDIT, 2: ADD
     * @param {*} state
     * @param {number} action.payload - new mode
     */
    toggleMode: (state, action) => {
      if (action.payload === state.mode) state.mode = IDLE;
      else state.mode = action.payload;
    },
  },
});

export const {
  playPause,
  posInit,
  controlInit,

  setSelected,
  toggleSelected,

  editCurrentStatus,
  saveCurrentStatus,
  deleteCurrentStatus,

  setCurrentPos,
  saveCurrentPos,
  deleteCurrentPos,

  setTime,
  setPosFrame,
  setControlFrame,

  setMode,
  toggleMode,
} = globalSlice.actions;

export const selectGlobal = (state) => state.global;

export default globalSlice.reducer;
