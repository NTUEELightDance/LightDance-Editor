/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
// constants
import { IDLE, EDIT, ADD } from "../constants";
// utils
import {
  clamp,
  updateFrameByTime,
  interpolationPos,
  fadeStatus,
} from "../utils/math";
import { setItem, getItem } from "../utils/localStorage";

const syncPost = (type, mode, data, frame) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("type", type);
  urlencoded.append("mode", mode);
  urlencoded.append("data", data);
  if (mode === "edit") {
    urlencoded.append("frame", frame);
  }

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  return fetch("/api/sync", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(JSON.parse(JSON.parse(result).data)))
    .catch((error) => console.log("error", error));
};

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    isPlaying: false, // isPlaying
    selected: [], // array of selected dancer's name

    currentFade: false, // current control Frame will fade to next
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

    presets: [],
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
     * Initiate controlRecord and currentStatus (call by simulator/controller.js)
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
     * Initiate posRecord and currentPos (call by simulator/controller.js)
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
     * Set current Fade
     * @param {*} state
     * @param {*} action
     */
    setCurrentFade: (state, action) => {
      const fade = action.payload;
      if (typeof fade !== "boolean")
        throw new Error(
          `[Error] setCurrentFade, invalid paramter(fade), ${fade}`
        );
      state.currentFade = fade;
    },

    /**
     * Save currentFade to controlRecord
     * @param {*} state
     */
    saveCurrentFade: (state) => {
      state.controlRecord[state.timeData.controlFrame].fade = state.currentFade;
      setItem("control", JSON.stringify(state.controlRecord));
    },

    /**
     * Set currentStatus
     * @param {*} state
     * @param {*} action.payload - status
     */
    setCurrentStatus: (state, action) => {
      state.currentStatus = action.payload;
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
     * Edit current Status (LED)
     * @param {} state
     */
    editCurrentStatusLED: (state, action) => {
      const {
        dancerName,
        partName,
        value: { src, alpha },
      } = action.payload;
      if (src && src !== "")
        state.currentStatus[dancerName][partName].src = src;
      if (alpha) state.currentStatus[dancerName][partName].alpha = alpha;
    },

    /**
     * Save currentStatus, according to controlFrame and mode
     * @param {*} state
     */
    saveCurrentStatus: (state, newChange) => {
      if (state.mode === EDIT) {
        state.controlRecord[state.timeData.controlFrame].status =
          state.currentStatus;
        syncPost(
          "control",
          "edit",
          JSON.stringify(newChange.payload.status),
          newChange.payload.frame
        );
      } else if (state.mode === ADD) {
        state.controlRecord.splice(state.timeData.controlFrame + 1, 1, {
          start: state.timeData.time,
          status: state.currentStatus,
        });
      }
      state.mode = IDLE;
      setItem("control", JSON.stringify(state.controlRecord));
    },

    /**
     * Sync status
     * @param {*} state
     */
    syncStatus: (state, syncData) => {
      const { mode, data } = syncData.payload;
      if (mode === "edit") {
        let { frame } = syncData.payload;
        frame = Number(frame);
        state.controlRecord[frame].status = JSON.parse(data);
        if (frame === state.timeData.controlFrame) {
          state.currentStatus = JSON.parse(data);
        }
      }
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
      setItem("control", JSON.stringify(state.controlRecord));
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
    saveCurrentPos: (state, newChange) => {
      if (state.mode === EDIT) {
        state.posRecord[state.timeData.posFrame].pos = state.currentPos;
        syncPost(
          "position",
          "edit",
          JSON.stringify(newChange.payload.currentPos),
          newChange.payload.controlFrame
        );
      } else if (state.mode === ADD) {
        state.posRecord.splice(state.timeData.posFrame + 1, 1, {
          start: state.timeData.time,
          pos: state.currentPos,
        });
      }
      state.mode = IDLE;
      setItem("position", JSON.stringify(state.posRecord));
    },

    /**
     * Sync pos
     * @param {*} state
     */
    syncPos: (state, syncData) => {
      const { mode, data } = syncData.payload;
      if (mode === "edit") {
        let { frame } = syncData.payload;
        frame = Number(frame);
        state.posRecord[frame].pos = JSON.parse(data);
        if (frame === state.timeData.posFrame) {
          state.currentPos = JSON.parse(data);
        }
      }
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
      setItem("position", JSON.stringify(state.posRecord));
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
      // status fade
      if (newControlFrame === state.controlRecord.length - 1) {
        // Can't fade
        state.currentStatus = state.controlRecord[newControlFrame].status;
      } else {
        // do fade
        state.currentStatus = fadeStatus(
          time,
          state.controlRecord[newControlFrame],
          state.controlRecord[newControlFrame + 1]
        );
      }

      // set timeData.posFrame and currentPos
      const newPosFrame = updateFrameByTime(
        state.posRecord,
        state.timeData.posFrame,
        time
      );
      state.timeData.posFrame = newPosFrame;
      // position interpolation
      if (newPosFrame === state.posRecord.length - 1) {
        // can't interpolation
        state.currentPos = state.posRecord[newPosFrame].pos;
      } else {
        // do interpolation
        state.currentPos = interpolationPos(
          time,
          state.posRecord[newPosFrame],
          state.posRecord[newPosFrame + 1]
        );
      }

      // set currentFade
      state.currentFade = state.controlRecord[newControlFrame].fade;
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
      // set posFrame and currentPos as well (by time)
      const newPosFrame = updateFrameByTime(
        state.posRecord,
        state.timeData.posFrame,
        state.controlRecord[controlFrame].start
      );
      state.timeData.posFrame = newPosFrame;
      state.currentPos = state.posRecord[newPosFrame].pos;
      // set currentFade
      state.currentFade = state.controlRecord[controlFrame].fade;
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
      // set controlFrame and currentStatus as well (by time)
      const newControlFrame = updateFrameByTime(
        state.controlRecord,
        state.timeData.controlFrame,
        state.posRecord[posFrame].start
      );
      state.timeData.controlFrame = newControlFrame;
      state.currentStatus = state.controlRecord[newControlFrame].status;
      // set currentFade
      state.currentFade = state.controlRecord[newControlFrame].fade;
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

    /**
     * set Presets
     * @param {*} state
     * @param {*} action
     */
    setPresets: (state, action) => {
      state.presets = action.payload;
      setItem("presets", JSON.stringify(state.presets));
    },

    /**
     * edit a preset's name
     * @param {*} state
     * @param {*} action.payload - index and newName
     */
    editPresetsName: (state, action) => {
      const { name, idx } = action.payload;
      state.presets[idx].name = name;
      setItem("presets", JSON.stringify(state.presets));
    },

    /**
     * add Preset
     * @param {*} state
     * @param {*} action.payload
     */
    addPresets: (state, action) => {
      const name = action.payload;
      state.presets.push({ name, status: state.currentStatus });
      setItem("presets", JSON.stringify(state.presets));
    },

    /**
     * delete a preset (by index)
     * @param {*} state
     * @param {*} action
     */
    deletePresets: (state, action) => {
      const idx = action.payload;
      state.presets.splice(idx, 1);
      setItem("presets", JSON.stringify(state.presets));
    },
  },
});

export const {
  playPause,
  posInit,
  controlInit,

  setSelected,
  toggleSelected,

  setCurrentFade,
  saveCurrentFade,

  setCurrentStatus,
  editCurrentStatus,
  editCurrentStatusLED,
  saveCurrentStatus,
  syncStatus,
  deleteCurrentStatus,

  setCurrentPos,
  saveCurrentPos,
  syncPos,
  deleteCurrentPos,

  setTime,
  setPosFrame,
  setControlFrame,

  setMode,
  toggleMode,

  setPresets,
  editPresetsName,
  addPresets,
  deletePresets,
} = globalSlice.actions;

export const selectGlobal = (state) => state.global;

export default globalSlice.reducer;
