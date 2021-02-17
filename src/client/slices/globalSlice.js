/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import updateFrameByTime from "./utils";
// import control from "../../../data/control.json";
// import position from "../../../data/position.json";

export const globalSlice = createSlice({
  name: "global",
  initialState: {
    dancerNum: 0, // dancerNum
    isPlaying: false, // isPlaying
    selected: [], // dancer selected

    currentStatus: {}, // current dancers' frame, TODO: kill this
    currentFrame: {}, // current dancers' frame
    currentPos: {}, // currnet dancers' position

    controlRecord: {}, // all dancer's frame
    posRecord: {}, // all dancer's position

    timeData: {
      time: 0, // time
      controlFrame: 0, // control frame index
      posFrame: 0, // position frame index
    },
  },
  reducers: {
    /**
     * Play or Pause
     * @param {*} state - redux state
     */
    playPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },

    /**
     * Initiate controlRecord
     * @param {*} state - redux state
     * @param {object} action.payload - controlRecord
     */
    controlInit: (state, action) => {
      state.controlRecord = action.payload;
      state.dancerNum = Object.keys(state.controlRecord).length;
    },

    /**
     * Initiate posRecord
     * @param {*} state
     * @param {object} action.payload - posRecord
     */
    posInit: (state, action) => {
      state.posRecord = action.payload;
    },

    /**
     * Update Time data
     * @param {*} state
     * @param {object} action.payload -  {time, controlFrame, postFrame}
     */
    updateTimeData: (state, action) => {
      const { time: newTime } = action.payload;
      let {
        controlFrame: newControlFrame,
        posFram: newPosFrame, // ?????? posFrame?
      } = action.payload;

      if (!newControlFrame || !newPosFrame) {
        const { posFrame, controlFrame } = state.timeData;
        newControlFrame = updateFrameByTime(
          state.controlRecord,
          controlFrame,
          newTime
        );
        newPosFrame = updateFrameByTime(state.posRecord, posFrame, newTime);
      }
      state.timeData.controlFrame = newControlFrame;
      state.timeData.posFrame = newPosFrame;
      state.timeData.time = newTime;
    },

    /**
     * Set control frame index
     * @param {*} state
     * @param {number} action.payload - new Frame Index
     */
    setControlFrame: (state, action) => {
      state.timeData.controlFrame = action.payload;
    },

    /**
     * Set pos frame index
     * @param {*} state
     * @param {number} action.payload - new Pos Index
     */
    setPosFrame: (state, action) => {
      state.timeData.posFrame = action.payload;
    },

    /**
     * Set selected array
     * @param {*} state
     * @param {array of number} action.payload - new selected array
     */
    setSeletected: (state, action) => {
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
      const { id, x, y, z } = action.payload;
      state.currentPos[`player${id}`] = { x, y, z };
    },

    /**
     *
     * @param {*} state
     */
    setNewPosRecord: (state) => {
      // can't save while playing
      if (state.isPlaying) return;

      const { time: curTime, posFrame } = state.timeData;

      Object.keys(state.currentPos).forEach((curName) => {
        const posData = state.currentPos[curName];
        let { x, y, z } = posData;
        [x, y, z] = [x, y, z].map((ele) => Math.round(ele * 1000) / 1000);
        const newPosFrame = { Start: curTime, x, y, z };
        const cloestPosFrame = updateFrameByTime(
          state.posRecord,
          posFrame,
          curTime
        );
        state.timeData.posFrame = cloestPosFrame;
        if (state.posRecord[curName]) {
          if (state.posRecord["player0"][cloestPosFrame].Start === curTime) {
            state.posRecord[curName][cloestPosFrame] = newPosFrame;
          } else {
            state.posRecord[curName].splice(cloestPosFrame + 1, 0, newPosFrame);
          }
        } else {
          state.posRecord[curName] = [newPosFrame];
        }
      });
    },
  },
});

export const {
  playPause,
  posInit,
  controlInit,
  updateTimeData,
  setControlFrame,
  setPosFrame,
  setSeletected,
  setCurrentStatus,
  setCurrentPos,
  setNewPosRecord,
} = globalSlice.actions;

export const selectGlobal = (state) => state.global;

export default globalSlice.reducer;
