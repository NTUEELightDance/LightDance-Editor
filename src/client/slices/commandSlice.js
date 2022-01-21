"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBoardConfig = exports.selectCommand = exports.clearDancerStatusMsg = exports.updateDancerStatus = exports.initDancerStatus = exports.startPlay = exports.setStop = exports.setPlay = exports.commandSlice = void 0;
/* eslint-disable no-param-reassign */
const toolkit_1 = require("@reduxjs/toolkit");
exports.commandSlice = (0, toolkit_1.createSlice)({
    name: "command",
    initialState: {
        play: false,
        stop: false,
        startTime: 0,
        sysTime: 0,
        dancerStatus: {}, // { dancerName: status }
    },
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
            const { dancerName, newStatus: { OK, msg, isConnected, ip }, } = action.payload;
            state.dancerStatus[dancerName] = {
                isConnected: isConnected !== undefined
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
_a = exports.commandSlice.actions, exports.setPlay = _a.setPlay, exports.setStop = _a.setStop, exports.startPlay = _a.startPlay, exports.initDancerStatus = _a.initDancerStatus, exports.updateDancerStatus = _a.updateDancerStatus, exports.clearDancerStatusMsg = _a.clearDancerStatusMsg;
const selectCommand = (state) => state.command;
exports.selectCommand = selectCommand;
const fetchJson = (path) => {
    return fetch(path).then((data) => data.json());
};
const fetchBoardConfig = () => (dispath) => __awaiter(void 0, void 0, void 0, function* () {
    const boardConfig = yield fetchJson("/data/board_config.json");
    dispath((0, exports.initDancerStatus)(boardConfig));
});
exports.fetchBoardConfig = fetchBoardConfig;
exports.default = exports.commandSlice.reducer;
