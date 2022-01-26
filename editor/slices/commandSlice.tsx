/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";
import { commandState, dancerStatusType } from "../types/commandSlice";
const initialState: commandState = {
  play: false,
  stop: false,

  startTime: 0,
  sysTime: 0,

  dancerStatus: {},
};
export const commandSlice = createSlice({
  name: "command",
  initialState,
  reducers: {
    setPlay: (state, action) => {
      state.play = action.payload;
    },
    setStop: (state, action) => {
      state.stop = action.payload;
      state.play = false;
    },
    startPlay: (state, action) => {
      const { startTime, sysTime } = action.payload;
      state.startTime = startTime;
      state.sysTime = sysTime;
      state.stop = false;
      state.play = true;
    },

    /**
     * Init the dancer status array, array of all dancers' statuts
     * @param {*} state
     * @param {*} action.payload - boardConfig
     */
    initDancerStatus: (state, action) => {
      const boardConfig = action.payload;
      const newDancerStatus = {};
      Object.entries(boardConfig).forEach(([hostname, { dancerName }]) => {
        newDancerStatus[dancerName] = {
          dancerName,
          ip: "",
          hostname,
          isConnected: false,
          msg: "",
        };
      });
      state.dancerStatus = newDancerStatus;
    },

    /**
     * update Dancer status by dancerName
     * @param {*} state
     * @param {*} action
     */
    updateDancerStatus: (state, action) => {
      const {
        dancerName,
        newStatus: { OK, msg, isConnected, ip },
      } = action.payload;
      state.dancerStatus[dancerName] = {
        isConnected:
          isConnected !== undefined
            ? isConnected
            : state.dancerStatus[dancerName].isConnected,
        msg: msg || state.dancerStatus[dancerName].msg,
        ip: ip || state.dancerStatus[dancerName].ip,
        OK,
      };
    },

    /**
     * clear Dancer status
     * @param {*} state
     * @param {*} action
     */
    clearDancerStatusMsg: (state, action) => {
      const { dancerNames } = action.payload;
      dancerNames.forEach((dancerName) => {
        state.dancerStatus[dancerName].msg = "";
      });
    },
  },
});

export const {
  setPlay,
  setStop,
  startPlay,
  initDancerStatus,
  updateDancerStatus,
  clearDancerStatusMsg,
} = commandSlice.actions;

export const selectCommand = (state) => state.command;

const fetchJson = (path) => {
  return fetch(path).then((data) => data.json());
};

export const fetchBoardConfig = () => async (dispath) => {
  const boardConfig = await fetchJson("/data/board_config.json");

  dispath(initDancerStatus(boardConfig));
};

export default commandSlice.reducer;
