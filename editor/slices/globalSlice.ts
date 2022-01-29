/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// constants
import { IDLE, EDIT, ADD } from "../constants";
// utils
import {
  clamp,
  updateFrameByTime,
  updateFrameByTimeMap,
  interpolationPos,
  fadeStatus,
} from "../utils/math";
import { setItem, getItem } from "../utils/localStorage";
import { nanoid } from "nanoid";
import {
  globalState,
  ControlMapType,
  ControlRecordType,
  posRecordType,
  ControlMapStatus,
  LED,
  positionType,
  lightPresetsType,
  posPresetsType,
  ControlMapElement,
  EffectRecordMapType,
  EffectStatusMapType,
} from "../types/globalSlice";
import { RootState } from "../store/index";

const initialState: globalState = {
  isPlaying: false, // isPlaying
  selected: [], // array of selected dancer's name

  currentFade: false, // current control Frame will fade to next
  currentStatus: {}, // current dancers' status
  currentPos: {}, // currnet dancers' position

  controlRecord: [], // array of all dancer's status
  controlMap: {},
  posRecord: [], // array of all dancer's pos

  timeData: {
    from: "", // update from what component
    time: 0, // time
    controlFrame: 0, // control frame's index
    posFrame: 0, // positions' index
  },

  mode: 0, // 0: nothing, 1: edit, 2: add

  lightPresets: [], // lightPresets, presets for light
  posPresets: [], // posPresets, presets for pos

  effectRecordMap: {}, // map of all effects and corresponding record ID array
  effectStatusMap: {}, // map of effect record ID and its status
};
export const globalSlice = createSlice({
  name: "global",
  initialState,
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
    controlInit: (
      state,
      action: PayloadAction<{
        controlRecord: ControlRecordType;
        controlMap: ControlMapType;
      }>
    ) => {
      const { controlRecord, controlMap } = action.payload;
      if (controlRecord.length === 0)
        throw new Error(`[Error] controlInit, controlRecord is empty `);
      state.controlRecord = controlRecord;
      state.controlMap = controlMap;
      state.currentStatus = controlMap[controlRecord[0]].status;
    },

    /**
     * Initiate posRecord and currentPos (call by simulator/controller.js)
     * @param {*} state
     * @param {object} action.payload - posRecord
     */
    posInit: (state, action: PayloadAction<posRecordType>) => {
      const posRecord = action.payload;
      if (posRecord.length === 0)
        throw new Error(`[Error] posInit, posRecord is empty `);
      state.posRecord = posRecord;
      state.currentPos = posRecord[0].pos;
      console.log(posRecord);
    },

    /**
     * Set selected array
     * @param {*} state
     * @param {array of number} action.payload - array of dancer's name
     */
    setSelected: (state, action: PayloadAction<string[]>) => {
      state.selected = action.payload;
    },

    /**
     * toggle one in selected array
     * @param {*} state
     * @param {string} action.payload - one of dancer's name
     */
    toggleSelected: (state, action: PayloadAction<string>) => {
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
    setCurrentFade: (state, action: PayloadAction<boolean>) => {
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
      state.controlMap[state.controlRecord[state.timeData.controlFrame]].fade =
        state.currentFade;
      // setItem("control", JSON.stringify(state.controlRecord));
    },

    /**
     * Set currentStatus
     * @param {*} state
     * @param {*} action.payload - status
     */
    setCurrentStatus: (state, action: PayloadAction<ControlMapStatus>) => {
      state.currentStatus = action.payload;
    },

    /**
     * Edit current Status
     * @param {} state
     * @param {*} action.payload - { dancerName, partName, value} to set EL part
     */
    editCurrentStatus: (
      state,
      action: PayloadAction<{
        dancerName: string;
        partName: string;
        value: number;
      }>
    ) => {
      const { dancerName, partName, value } = action.payload;
      state.currentStatus[dancerName][partName] = value;
    },

    /**
     * Edit current Status (LED)
     * @param {} state
     */

    editCurrentStatusLED: (
      state,
      action: PayloadAction<{
        dancerName: string;
        partName: string;
        value: { src: string; alpha: number };
      }>
    ) => {
      const {
        dancerName,
        partName,
        value: { src, alpha },
      } = action.payload;
      if (src && src !== "")
        (state.currentStatus[dancerName][partName] as LED).src = src;
      if (typeof alpha === "number")
        (state.currentStatus[dancerName][partName] as LED).alpha = alpha;
    },

    /**
     * Save currentStatus, according to controlFrame and mode
     * @param {*} state
     */
    saveCurrentStatus: (state) => {
      console.log("state", state);
      if (state.mode === EDIT) {
        state.controlMap[
          state.controlRecord[state.timeData.controlFrame]
        ].status = state.currentStatus;
        // const data = {
        //   status: JSON.stringify(state.currentStatus),
        //   frame: state.timeData.controlFrame,
        //   fade: state.currentFade,
        // };
        // syncPost(
        //   state.branch,
        //   state.username,
        //   "control",
        //   "EDIT",
        //   JSON.stringify(data)
        // );
      } else if (state.mode === ADD) {
        // generate id
        const newId = nanoid(6);
        state.controlMap[newId] = {
          start: state.timeData.time,
          status: state.currentStatus,
          fade: state.currentFade,
        };

        state.controlRecord.splice(state.timeData.controlFrame + 1, 0, newId);

        // const data = {
        //   status: JSON.stringify(state.currentStatus),
        //   frame: state.timeData.controlFrame + 1,
        //   time: state.timeData.time,
        //   fade: state.currentFade,
        // };

        // if (sub)
        //   syncPost(
        //     state.branch,
        //     state.username,
        //     "control",
        //     "EDIT",
        //     JSON.stringify(data)
        //   );
        // else
        //   syncPost(
        //     state.branch,
        //     state.username,
        //     "control",
        //     "ADD",
        //     JSON.stringify(data)
        //   );
      }
      state.mode = IDLE;
      // setItem("control", JSON.stringify(state.controlRecord));
    },

    saveToLocal: (state) => {
      setItem("control", JSON.stringify(state.controlRecord));
      setItem("controlMap", JSON.stringify(state.controlMap));
      console.log("Control Saved to Local Storage...");
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
      // const data = { frame: state.timeData.controlFrame };
      // syncPost(
      //   state.branch,
      //   state.username,
      //   "control",
      //   "DEL",
      //   JSON.stringify(data)
      // );
      delete state.controlMap[state.controlRecord[state.timeData.controlFrame]];
      state.controlRecord.splice(state.timeData.controlFrame, 1);
      setItem("control", JSON.stringify(state.controlRecord));
    },

    /**
     * Set current pos By Name
     * @param {*} state
     * @param {object} action.payload - new dancer's pos
     */
    setCurrentPosByName: (
      state,
      action: PayloadAction<{
        name: string;
        x: number;
        y: number;
        z: number;
      }>
    ) => {
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
     * set current pos
     * @param {*} state
     * @param {*} action.payload - new pos
     */
    setCurrentPos: (state, action: PayloadAction<positionType>) => {
      state.currentPos = action.payload;
    },

    /**
     * Save currentPos to posRecord
     * @param {*} state
     */
    saveCurrentPos: (state) => {
      if (state.mode === EDIT) {
        state.posRecord[state.timeData.posFrame].pos = state.currentPos;
        // const data = {
        //   pos: JSON.stringify(state.currentPos),
        //   frame: state.timeData.posFrame,
        // };
        // syncPost(
        //   state.branch,
        //   state.username,
        //   "position",
        //   "EDIT",
        //   JSON.stringify(data)
        // );
      } else if (state.mode === ADD) {
        state.posRecord.splice(state.timeData.posFrame + 1, 0, {
          start: state.timeData.time,
          pos: state.currentPos,
        });

        // const data = {
        //   pos: JSON.stringify(state.currentPos),
        //   frame: state.timeData.posFrame + 1 - sub,
        //   time: state.timeData.time,
        // };

        // if (sub)
        //   syncPost(
        //     state.branch,
        //     state.username,
        //     "position",
        //     "EDIT",
        //     JSON.stringify(data)
        //   );
        // else
        //   syncPost(
        //     state.branch,
        //     state.username,
        //     "position",
        //     "ADD",
        //     JSON.stringify(data)
        //   );
      }
      state.mode = IDLE;
      setItem("position", JSON.stringify(state.posRecord));
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
      // const data = { frame: state.timeData.posFrame };
      // syncPost(
      //   state.branch,
      //   state.username,
      //   "position",
      //   "DEL",
      //   JSON.stringify(data)
      // );
      state.posRecord.splice(state.timeData.posFrame, 1);
      setItem("position", JSON.stringify(state.posRecord));
    },

    /**
     * set timeData by time, also set currentStatus and currentPos
     * @param {} state
     * @param {*} action.payload - number
     */
    setTime: (state, action: PayloadAction<{ from: string; time: number }>) => {
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

      const newControlFrame = updateFrameByTimeMap(
        state.controlRecord,
        state.controlMap,
        state.timeData.controlFrame,
        time
      );
      state.timeData.controlFrame = newControlFrame;
      // status fade
      if (newControlFrame === state.controlRecord.length - 1) {
        // Can't fade
        state.currentStatus =
          state.controlMap[state.controlRecord[newControlFrame]].status;
      } else {
        // do fade
        state.currentStatus = fadeStatus(
          time,
          state.controlMap[state.controlRecord[newControlFrame]],
          state.controlMap[state.controlRecord[newControlFrame + 1]]
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
      state.currentFade =
        state.controlMap[state.controlRecord[newControlFrame]].fade;
    },

    /**
     * set timeData by controlFrame, also set currentStatus
     * @param {} state
     * @param {*} action.payload - number
     */
    setControlFrame: (
      state,
      action: PayloadAction<{
        from: string;
        controlFrame: number;
      }>
    ) => {
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
      state.timeData.time =
        state.controlMap[state.controlRecord[controlFrame]].start;
      state.currentStatus =
        state.controlMap[state.controlRecord[controlFrame]].status;
      // set posFrame and currentPos as well (by time)
      const newPosFrame = updateFrameByTime(
        state.posRecord,
        state.timeData.posFrame,
        state.controlMap[state.controlRecord[controlFrame]].start
      );
      state.timeData.posFrame = newPosFrame;
      state.currentPos = state.posRecord[newPosFrame].pos;
      // set currentFade
      state.currentFade =
        state.controlMap[state.controlRecord[controlFrame]].fade;
    },

    /**
     * set timeData by posFrame, also set currentPos
     * @param {} state
     * @param {*} action.payload - number
     */
    setPosFrame: (
      state,
      action: PayloadAction<{
        from: string;
        posFrame: number;
      }>
    ) => {
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
      const tmp = [];
      for (const id of state.controlRecord) tmp.push(state.controlMap[id]);

      const newControlFrame = updateFrameByTime(
        tmp,
        state.timeData.controlFrame,
        state.posRecord[posFrame].start
      );
      state.timeData.controlFrame = newControlFrame;
      state.currentStatus =
        state.controlMap[state.controlRecord[newControlFrame]].status;
      // set currentFade
      state.currentFade =
        state.controlMap[state.controlRecord[newControlFrame]].fade;
    },

    /**
     * set editor mode, 0: IDLE, 1: EDIT, 2: ADD
     * @param {*} state
     * @param {number} action.payload - new mode
     */
    setMode: (state, action: PayloadAction<number>) => {
      state.mode = action.payload;
    },

    /**
     * toggle editor mode, 0: IDLE, 1: EDIT, 2: ADD
     * @param {*} state
     * @param {number} action.payload - new mode
     */
    toggleMode: (state, action: PayloadAction<number>) => {
      if (action.payload === state.mode) {
        state.mode = IDLE;
        //reset currentStatus when switching mode back to IDLE
        const currentControlFrame = state.timeData.controlFrame;
        if (currentControlFrame === state.controlRecord.length - 1) {
          // Can't fade
          state.currentStatus =
            state.controlMap[state.controlRecord[currentControlFrame]].status;
        } else {
          // do fade
          state.currentStatus = fadeStatus(
            state.timeData.time,

            state.controlMap[state.controlRecord[currentControlFrame]],
            state.controlMap[state.controlRecord[currentControlFrame + 1]]
          );
        }
        //reset currentPosFrame when switching mode back to IDLE
        const currentPosFrame = state.timeData.posFrame;
        if (currentPosFrame === state.posRecord.length - 1) {
          // can't interpolation
          state.currentPos = state.posRecord[currentPosFrame].pos;
        } else {
          // do interpolation
          state.currentPos = interpolationPos(
            state.timeData.time,
            state.posRecord[currentPosFrame],
            state.posRecord[currentPosFrame + 1]
          );
        }
      } else state.mode = action.payload;
    },

    /**
     * set lightPresets
     * @param {*} state
     * @param {*} action
     */
    setLightPresets: (state, action: PayloadAction<lightPresetsType>) => {
      state.lightPresets = action.payload;
      setItem("lightPresets", JSON.stringify(state.lightPresets));
    },

    /**
     * edit a lightPreset's name
     * @param {*} state
     * @param {*} action.payload - index and newName
     */
    editLightPresetsName: (
      state,
      action: PayloadAction<{ name: string; idx: number }>
    ) => {
      const { name, idx } = action.payload;
      state.lightPresets[idx].name = name;
      setItem("lightPresets", JSON.stringify(state.lightPresets));
    },

    /**
     * add lightPresets
     * @param {*} state
     * @param {*} action.payload
     */
    addLightPresets: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      state.lightPresets.push({ name, status: state.currentStatus });
      setItem("lightPresets", JSON.stringify(state.lightPresets));
    },

    /**
     * delete a lightPreset (by index)
     * @param {*} state
     * @param {*} action
     */
    deleteLightPresets: (state, action: PayloadAction<number>) => {
      const idx = action.payload;
      state.lightPresets.splice(idx, 1);
      setItem("lightPresets", JSON.stringify(state.lightPresets));
    },

    /**
     * set lightPresets
     * @param {*} state
     * @param {*} action
     */
    setPosPresets: (state, action: PayloadAction<posPresetsType>) => {
      state.posPresets = action.payload;
      setItem("posPresets", JSON.stringify(state.posPresets));
    },

    /**
     * edit a lightPreset's name
     * @param {*} state
     * @param {*} action.payload - index and newName
     */
    editPosPresetsName: (
      state,
      action: PayloadAction<{
        name: string;
        idx: number;
      }>
    ) => {
      const { name, idx } = action.payload;
      state.posPresets[idx].name = name;
      setItem("posPresets", JSON.stringify(state.posPresets));
    },

    /**
     * add lightPresets
     * @param {*} state
     * @param {*} action.payload
     */
    addPosPresets: (state, action: PayloadAction<string>) => {
      const name = action.payload;
      state.posPresets.push({ name, pos: state.currentPos });
      setItem("posPresets", JSON.stringify(state.posPresets));
    },

    /**
     * delete a lightPreset (by index)
     * @param {*} state
     * @param {*} action
     */
    deletePosPresets: (state, action: PayloadAction<number>) => {
      const idx = action.payload;
      state.posPresets.splice(idx, 1);
      setItem("posPresets", JSON.stringify(state.posPresets));
    },

    /**
     * set effectRecordMap
     * @param {*} state
     * @param {*} action
     */
    setEffectRecordMap: (state, action: PayloadAction<EffectRecordMapType>) => {
      state.effectRecordMap = action.payload;
      setItem("effectRecordMap", JSON.stringify(state.effectRecordMap));
    },

    /**
     * set effectStatusMap
     * @param {*} state
     * @param {*} action
     */
    setEffectStatusMap: (state, action: PayloadAction<EffectStatusMapType>) => {
      state.effectStatusMap = action.payload;
      setItem("effectStatusMap", JSON.stringify(state.effectStatusMap));
    },

    /**
     * Shift frame time from startFrame to endFrame += shiftTime
     */
    shiftFrameTime: (
      state,
      action: PayloadAction<{
        type: string;
        startFrame: number;
        endFrame: number;
        shiftTime: number;
      }>
    ) => {
      const { type, startFrame, endFrame, shiftTime } = action.payload;
      console.log(type, startFrame, endFrame, shiftTime);

      if (type === "control") {
        const controlMapCopy = { ...state.controlMap };
        for (let i = Number(startFrame); i <= Number(endFrame); i += 1) {
          controlMapCopy[state.controlRecord[i]].start += shiftTime;
        }
        const controlRecordCopy = [...state.controlRecord];
        state.controlRecord = controlRecordCopy.sort(
          (a, b) => controlMapCopy[a].start - controlMapCopy[b].start
        );
        state.controlMap = controlMapCopy;
      } else {
        const posRecordCopy = [...state.posRecord];
        for (let i = Number(startFrame); i <= Number(endFrame); i += 1) {
          posRecordCopy[i].start += shiftTime;
        }
        posRecordCopy.sort((a, b) => a.start - b.start);
      }
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
  deleteCurrentStatus,

  setCurrentPosByName,
  setCurrentPos,
  saveCurrentPos,
  saveToLocal,
  deleteCurrentPos,

  setTime,
  setPosFrame,
  setControlFrame,

  setMode,
  toggleMode,

  setLightPresets,
  editLightPresetsName,
  addLightPresets,
  deleteLightPresets,

  setPosPresets,
  editPosPresetsName,
  addPosPresets,
  deletePosPresets,

  setEffectRecordMap,
  setEffectStatusMap,

  shiftFrameTime,
} = globalSlice.actions;

export const selectGlobal = (state: RootState) => state.global;

export default globalSlice.reducer;
