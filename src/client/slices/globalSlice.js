"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectGlobal = exports.shiftFrameTime = exports.deletePosPresets = exports.addPosPresets = exports.editPosPresetsName = exports.setPosPresets = exports.deleteLightPresets = exports.addLightPresets = exports.editLightPresetsName = exports.setLightPresets = exports.toggleMode = exports.setMode = exports.setControlFrame = exports.setPosFrame = exports.setTime = exports.syncDelete = exports.deleteCurrentPos = exports.syncPos = exports.saveToLocal = exports.saveCurrentPos = exports.setCurrentPos = exports.setCurrentPosByName = exports.deleteCurrentStatus = exports.syncStatus = exports.saveCurrentStatus = exports.editCurrentStatusLED = exports.editCurrentStatus = exports.setCurrentStatus = exports.saveCurrentFade = exports.setCurrentFade = exports.toggleSelected = exports.setSelected = exports.controlInit = exports.posInit = exports.playPause = exports.globalSlice = void 0;
/* eslint-disable no-restricted-globals */
/* eslint-disable no-param-reassign */
const toolkit_1 = require("@reduxjs/toolkit");
// constants
const constants_1 = require("../constants");
// utils
const math_1 = require("../utils/math");
const localStorage_1 = require("../utils/localStorage");
const nanoid_1 = __importDefault(require("nanoid"));
// import { syncPost, loginPost } from "../api";
exports.globalSlice = (0, toolkit_1.createSlice)({
    name: "global",
    initialState: {
        isPlaying: false,
        selected: [],
        currentFade: false,
        currentStatus: {},
        currentPos: {},
        controlRecord: [],
        controlMap: {},
        posRecord: [],
        timeData: {
            from: "",
            time: 0,
            controlFrame: 0,
            posFrame: 0, // positions' index
        },
        mode: 0,
        lightPresets: [],
        posPresets: [], // posPresets, presets for pos
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
            }
            else
                state.selected.push(name);
        },
        /**
         * Set current Fade
         * @param {*} state
         * @param {*} action
         */
        setCurrentFade: (state, action) => {
            const fade = action.payload;
            if (typeof fade !== "boolean")
                throw new Error(`[Error] setCurrentFade, invalid paramter(fade), ${fade}`);
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
            const { dancerName, partName, value: { src, alpha }, } = action.payload;
            if (src && src !== "")
                state.currentStatus[dancerName][partName].src = src;
            if (typeof alpha === "number")
                state.currentStatus[dancerName][partName].alpha = alpha;
        },
        /**
         * Save currentStatus, according to controlFrame and mode
         * @param {*} state
         */
        saveCurrentStatus: (state) => {
            console.log("state", state);
            if (state.mode === constants_1.EDIT) {
                state.controlMap[state.controlRecord[state.timeData.controlFrame]].status = state.currentStatus;
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
            }
            else if (state.mode === constants_1.ADD) {
                // generate id
                const newId = (0, nanoid_1.default)(6);
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
            state.mode = constants_1.IDLE;
            // setItem("control", JSON.stringify(state.controlRecord));
        },
        saveToLocal: (state) => {
            (0, localStorage_1.setItem)("control", JSON.stringify(state.controlRecord));
            (0, localStorage_1.setItem)("controlMap", JSON.stringify(state.controlMap));
            console.log("Control Saved to Local Storage...");
        },
        /**
         * Sync status
         * @param {*} state
         */
        syncStatus: (state, syncData) => {
            const { mode, from, time } = syncData.payload;
            const data = JSON.parse(syncData.payload.data);
            state.lastUpdateTime = time;
            (0, localStorage_1.setItem)("lastUpdateTime", state.lastUpdateTime);
            if (mode === "EDIT") {
                let { frame } = data; //probably from backend
                frame = Number(frame);
                state.controlRecord[frame].status = JSON.parse(data.status);
                state.controlRecord[frame].fade = data.fade;
                if (frame === state.timeData.controlFrame) {
                    state.currentStatus = JSON.parse(data.status);
                }
            }
            if (mode === "ADD" && from !== state.username) {
                let { frame } = data;
                const { time, status, fade } = data;
                frame = Number(frame);
                state.controlRecord.splice(frame, 0, {
                    start: Number(time),
                    status: JSON.parse(status),
                    fade,
                });
                if (frame === state.timeData.controlFrame) {
                    state.currentStatus = JSON.parse(status);
                    state.currentFade = fade;
                }
            }
            (0, localStorage_1.setItem)("control", JSON.stringify(state.controlRecord));
        },
        /**
         * Delete currentStatus, according to controlFrame
         * @param {*} state
         */
        deleteCurrentStatus: (state) => {
            if (state.mode !== constants_1.IDLE) {
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
            (0, localStorage_1.setItem)("control", JSON.stringify(state.controlRecord));
        },
        /**
         * Set current pos By Name
         * @param {*} state
         * @param {object} action.payload - new dancer's pos
         */
        setCurrentPosByName: (state, action) => {
            const { name, x, y, z } = action.payload;
            if (!state.currentPos[name])
                throw new Error(`[Error] setCurrentPos, invalid parameter(name), ${name}`);
            if (typeof x !== "number" ||
                typeof y !== "number" ||
                typeof z !== "number")
                throw new Error(`[Error] setCurrentPos, invalid parameter(x, y, z) ${x}, ${y}, ${z}`);
            state.currentPos[name] = { x, y, z };
        },
        /**
         * set current pos
         * @param {*} state
         * @param {*} action.payload - new pos
         */
        setCurrentPos: (state, action) => {
            state.currentPos = action.payload;
        },
        /**
         * Save currentPos to posRecord
         * @param {*} state
         */
        saveCurrentPos: (state) => {
            if (state.mode === constants_1.EDIT) {
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
            }
            else if (state.mode === constants_1.ADD) {
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
            state.mode = constants_1.IDLE;
            (0, localStorage_1.setItem)("position", JSON.stringify(state.posRecord));
        },
        /**
         * Sync pos
         * @param {*} state
         */
        syncPos: (state, syncData) => {
            const { mode, from, time } = syncData.payload;
            const data = JSON.parse(syncData.payload.data);
            state.lastUpdateTime = time;
            (0, localStorage_1.setItem)("lastUpdateTime", state.lastUpdateTime);
            if (mode === "EDIT") {
                let { frame } = data;
                frame = Number(frame);
                state.posRecord[frame].pos = JSON.parse(data.pos);
                if (frame === state.timeData.posFrame) {
                    state.currentPos = JSON.parse(data.pos);
                }
            }
            if (mode === "ADD" && from !== state.username) {
                let { frame } = data;
                const { time, pos } = data;
                frame = Number(frame);
                state.posRecord.splice(frame, 0, {
                    start: Number(time),
                    pos: JSON.parse(pos),
                });
                // if (frame === state.timeData.posFrame) {
                //   state.currentStatus = JSON.parse(pos);
                // }
            }
            (0, localStorage_1.setItem)("position", JSON.stringify(state.posRecord));
        },
        /**
         * Delete current pos
         * @param {*} state
         */
        deleteCurrentPos: (state) => {
            if (state.mode !== constants_1.IDLE) {
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
            (0, localStorage_1.setItem)("position", JSON.stringify(state.posRecord));
        },
        /**
         * sync Delete
         */
        syncDelete: (state, deleteData) => {
            const { time } = deleteData.payload;
            const data = JSON.parse(deleteData.payload.data);
            state.lastUpdateTime = time;
            (0, localStorage_1.setItem)("lastUpdateTime", state.lastUpdateTime);
            if (deleteData.payload.type === "position") {
                state.posRecord.splice(data.frame, 1);
                (0, localStorage_1.setItem)("control", JSON.stringify(state.controlRecord));
            }
            if (deleteData.payload.type === "control") {
                state.controlRecord.splice(data.frame, 1);
                (0, localStorage_1.setItem)("position", JSON.stringify(state.posRecord));
            }
        },
        /**
         * set timeData by time, also set currentStatus and currentPos
         * @param {} state
         * @param {*} action.payload - number
         */
        setTime: (state, action) => {
            let { from, time } = action.payload;
            if (from === undefined || time === undefined) {
                throw new Error(`[Error] setTime invalid parameter(from ${from}, time ${time})`);
            }
            if (isNaN(time))
                return;
            time = Math.max(time, 0);
            state.timeData.from = from;
            state.timeData.time = time;
            // set timeData.controlFrame and currentStatus
            const tmp = [];
            for (let id of state.controlRecord) {
                tmp.push(state.controlMap[id]);
            }
            const newControlFrame = (0, math_1.updateFrameByTime)(tmp, state.timeData.controlFrame, time);
            state.timeData.controlFrame = newControlFrame;
            // status fade
            if (newControlFrame === state.controlRecord.length - 1) {
                // Can't fade
                state.currentStatus =
                    state.controlMap[state.controlRecord[newControlFrame]].status;
            }
            else {
                // do fade
                state.currentStatus = (0, math_1.fadeStatus)(time, state.controlMap[state.controlRecord[newControlFrame]], state.controlMap[state.controlRecord[newControlFrame + 1]]);
            }
            // set timeData.posFrame and currentPos
            const newPosFrame = (0, math_1.updateFrameByTime)(state.posRecord, state.timeData.posFrame, time);
            state.timeData.posFrame = newPosFrame;
            // position interpolation
            if (newPosFrame === state.posRecord.length - 1) {
                // can't interpolation
                state.currentPos = state.posRecord[newPosFrame].pos;
            }
            else {
                // do interpolation
                state.currentPos = (0, math_1.interpolationPos)(time, state.posRecord[newPosFrame], state.posRecord[newPosFrame + 1]);
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
        setControlFrame: (state, action) => {
            let { from, controlFrame } = action.payload;
            if (from === undefined || controlFrame === undefined) {
                throw new Error(`[Error] setControlFrame invalid parameter(from ${from}, controlFrame ${controlFrame})`);
            }
            if (isNaN(controlFrame))
                return;
            controlFrame = (0, math_1.clamp)(controlFrame, 0, state.controlRecord.length - 1);
            state.timeData.from = from;
            state.timeData.controlFrame = controlFrame;
            state.timeData.time =
                state.controlMap[state.controlRecord[controlFrame]].start;
            state.currentStatus =
                state.controlMap[state.controlRecord[controlFrame]].status;
            // set posFrame and currentPos as well (by time)
            const newPosFrame = (0, math_1.updateFrameByTime)(state.posRecord, state.timeData.posFrame, state.controlMap[state.controlRecord[controlFrame]].start);
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
        setPosFrame: (state, action) => {
            let { from, posFrame } = action.payload;
            if (from === undefined || posFrame === undefined) {
                throw new Error(`[Error] setPosFrame invalid parameter(from ${from}, posFrame ${posFrame})`);
            }
            if (isNaN(posFrame))
                return;
            posFrame = (0, math_1.clamp)(posFrame, 0, state.posRecord.length - 1);
            state.timeData.from = from;
            state.timeData.posFrame = posFrame;
            state.timeData.time = state.posRecord[posFrame].start;
            state.currentPos = state.posRecord[posFrame].pos;
            // set controlFrame and currentStatus as well (by time)
            const tmp = [];
            for (const id of state.controlRecord)
                tmp.push(state.controlMap[id]);
            const newControlFrame = (0, math_1.updateFrameByTime)(tmp, state.timeData.controlFrame, state.posRecord[posFrame].start);
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
        setMode: (state, action) => {
            state.mode = action.payload;
        },
        /**
         * toggle editor mode, 0: IDLE, 1: EDIT, 2: ADD
         * @param {*} state
         * @param {number} action.payload - new mode
         */
        toggleMode: (state, action) => {
            if (action.payload === state.mode) {
                state.mode = constants_1.IDLE;
                //reset currentStatus when switching mode back to IDLE
                const currentControlFrame = state.timeData.controlFrame;
                if (currentControlFrame === state.controlRecord.length - 1) {
                    // Can't fade
                    state.currentStatus = state.controlRecord[currentControlFrame].status;
                }
                else {
                    // do fade
                    state.currentStatus = (0, math_1.fadeStatus)(state.timeData.time, state.controlRecord[currentControlFrame], state.controlRecord[currentControlFrame + 1]);
                }
                //reset currentPosFrame when switching mode back to IDLE
                const currentPosFrame = state.timeData.posFrame;
                if (currentPosFrame === state.posRecord.length - 1) {
                    // can't interpolation
                    state.currentPos = state.posRecord[currentPosFrame].pos;
                }
                else {
                    // do interpolation
                    state.currentPos = (0, math_1.interpolationPos)(state.timeData.time, state.posRecord[currentPosFrame], state.posRecord[currentPosFrame + 1]);
                }
            }
            else
                state.mode = action.payload;
        },
        /**
         * set lightPresets
         * @param {*} state
         * @param {*} action
         */
        setLightPresets: (state, action) => {
            state.lightPresets = action.payload;
            (0, localStorage_1.setItem)("lightPresets", JSON.stringify(state.lightPresets));
        },
        /**
         * edit a lightPreset's name
         * @param {*} state
         * @param {*} action.payload - index and newName
         */
        editLightPresetsName: (state, action) => {
            const { name, idx } = action.payload;
            state.lightPresets[idx].name = name;
            (0, localStorage_1.setItem)("lightPresets", JSON.stringify(state.lightPresets));
        },
        /**
         * add lightPresets
         * @param {*} state
         * @param {*} action.payload
         */
        addLightPresets: (state, action) => {
            const name = action.payload;
            state.lightPresets.push({ name, status: state.currentStatus });
            (0, localStorage_1.setItem)("lightPresets", JSON.stringify(state.lightPresets));
        },
        /**
         * delete a lightPreset (by index)
         * @param {*} state
         * @param {*} action
         */
        deleteLightPresets: (state, action) => {
            const idx = action.payload;
            state.lightPresets.splice(idx, 1);
            (0, localStorage_1.setItem)("lightPresets", JSON.stringify(state.lightPresets));
        },
        /**
         * set lightPresets
         * @param {*} state
         * @param {*} action
         */
        setPosPresets: (state, action) => {
            state.posPresets = action.payload;
            (0, localStorage_1.setItem)("posPresets", JSON.stringify(state.posPresets));
        },
        /**
         * edit a lightPreset's name
         * @param {*} state
         * @param {*} action.payload - index and newName
         */
        editPosPresetsName: (state, action) => {
            const { name, idx } = action.payload;
            state.posPresets[idx].name = name;
            (0, localStorage_1.setItem)("posPresets", JSON.stringify(state.posPresets));
        },
        /**
         * add lightPresets
         * @param {*} state
         * @param {*} action.payload
         */
        addPosPresets: (state, action) => {
            const name = action.payload;
            state.posPresets.push({ name, pos: state.currentPos });
            (0, localStorage_1.setItem)("posPresets", JSON.stringify(state.posPresets));
        },
        /**
         * delete a lightPreset (by index)
         * @param {*} state
         * @param {*} action
         */
        deletePosPresets: (state, action) => {
            const idx = action.payload;
            state.posPresets.splice(idx, 1);
            (0, localStorage_1.setItem)("posPresets", JSON.stringify(state.posPresets));
        },
        /**
         * Shift frame time from startFrame to endFrame += shiftTime
         */
        shiftFrameTime: (state, action) => {
            const { type, startFrame, endFrame, shiftTime } = action.payload;
            console.log(type, startFrame, endFrame, shiftTime);
            if (type === "control") {
                const controlMapCopy = Object.assign({}, state.controlMap);
                for (let i = Number(startFrame); i <= Number(endFrame); i += 1) {
                    controlMapCopy[state.controlRecord[i]].start += shiftTime;
                }
                const controlRecordCopy = [...state.controlRecord];
                state.controlRecord = controlRecordCopy.sort((a, b) => controlMapCopy[a].start - controlMapCopy[b].start);
                state.controlMap = controlMapCopy;
            }
            else {
                const posRecordCopy = [...state.posRecord];
                for (let i = Number(startFrame); i <= Number(endFrame); i += 1) {
                    posRecordCopy += shiftTime;
                }
                posRecordCopy.sort((a, b) => a.start - b.start);
            }
        },
    },
});
_a = exports.globalSlice.actions, exports.playPause = _a.playPause, exports.posInit = _a.posInit, exports.controlInit = _a.controlInit, exports.setSelected = _a.setSelected, exports.toggleSelected = _a.toggleSelected, exports.setCurrentFade = _a.setCurrentFade, exports.saveCurrentFade = _a.saveCurrentFade, exports.setCurrentStatus = _a.setCurrentStatus, exports.editCurrentStatus = _a.editCurrentStatus, exports.editCurrentStatusLED = _a.editCurrentStatusLED, exports.saveCurrentStatus = _a.saveCurrentStatus, exports.syncStatus = _a.syncStatus, exports.deleteCurrentStatus = _a.deleteCurrentStatus, exports.setCurrentPosByName = _a.setCurrentPosByName, exports.setCurrentPos = _a.setCurrentPos, exports.saveCurrentPos = _a.saveCurrentPos, exports.saveToLocal = _a.saveToLocal, exports.syncPos = _a.syncPos, exports.deleteCurrentPos = _a.deleteCurrentPos, exports.syncDelete = _a.syncDelete, exports.setTime = _a.setTime, exports.setPosFrame = _a.setPosFrame, exports.setControlFrame = _a.setControlFrame, exports.setMode = _a.setMode, exports.toggleMode = _a.toggleMode, exports.setLightPresets = _a.setLightPresets, exports.editLightPresetsName = _a.editLightPresetsName, exports.addLightPresets = _a.addLightPresets, exports.deleteLightPresets = _a.deleteLightPresets, exports.setPosPresets = _a.setPosPresets, exports.editPosPresetsName = _a.editPosPresetsName, exports.addPosPresets = _a.addPosPresets, exports.deletePosPresets = _a.deletePosPresets, exports.shiftFrameTime = _a.shiftFrameTime;
const selectGlobal = (state) => state.global;
exports.selectGlobal = selectGlobal;
exports.default = exports.globalSlice.reducer;
