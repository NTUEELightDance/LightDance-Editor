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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLoad = exports.selectLoad = exports.loadSlice = void 0;
/* eslint-disable no-param-reassign */
const toolkit_1 = require("@reduxjs/toolkit");
exports.loadSlice = (0, toolkit_1.createSlice)({
    name: "load",
    initialState: {
        init: false,
        music: "",
        load: {},
        control: [],
        controlMap: {},
        position: [],
        lightPresets: [],
        posPresets: [],
        texture: {},
        dancers: {},
        dancerNames: {}, // [name]
    },
    reducers: {
        setInit: (state) => {
            state.init = true;
        },
        setLoad: (state, action) => {
            state.load = action.payload;
        },
        setMusic: (state, action) => {
            state.music = action.payload;
        },
        setControl: (state, action) => {
            state.control = action.payload;
        },
        setControlMap: (state, action) => {
            state.controlMap = action.payload;
        },
        setPosition: (state, action) => {
            state.position = action.payload;
        },
        setLightPresets: (state, action) => {
            state.lightPresets = action.payload;
        },
        setPosPresets: (state, action) => {
            state.posPresets = action.payload;
        },
        setTexture: (state, action) => {
            state.texture = action.payload;
        },
        setDancers: (state, action) => {
            state.dancers = action.payload;
        },
        setDancerNames: (state, action) => {
            state.dancerNames = action.payload;
        },
    },
});
const { setInit, setLoad, setMusic, setControl, setControlMap, setPosition, setLightPresets, setPosPresets, setTexture, setDancers, setDancerNames, } = exports.loadSlice.actions;
const selectLoad = (state) => state.load;
exports.selectLoad = selectLoad;
const fetchJson = (path) => {
    return fetch(path).then((data) => data.json());
};
const fetchLoad = () => (dispatch) => __awaiter(void 0, void 0, void 0, function* () {
    const load = yield fetchJson("/data/load.json");
    const { Music, Control, ControlMap, Position, LightPresets, PosPresets, Dancers, Texture, } = load;
    // set load
    dispatch(setLoad(load));
    // set Music
    dispatch(setMusic(Music));
    // set Control
    const control = yield fetchJson(Control);
    dispatch(setControl(control));
    // set ControlMap
    const controlMap = yield fetchJson(ControlMap);
    dispatch(setControlMap(controlMap));
    // set Position
    const position = yield fetchJson(Position);
    dispatch(setPosition(position));
    // set lightPresets
    const lightPresets = yield fetchJson(LightPresets);
    dispatch(setLightPresets(lightPresets));
    // set lightPresets
    const posPresets = yield fetchJson(PosPresets);
    dispatch(setPosPresets(posPresets));
    // set Dancer Names
    dispatch(setDancerNames(Dancers.names));
    const dancers = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const name of Dancers.names) {
        // eslint-disable-next-line no-await-in-loop
        dancers[name] = yield fetchJson(`${Dancers.prefix}${name}${Dancers.postfix}`);
    }
    dispatch(setDancers(dancers));
    // set Textures
    const texture = yield fetchJson(Texture);
    dispatch(setTexture(texture));
    // finish, set Init
    dispatch(setInit());
});
exports.fetchLoad = fetchLoad;
exports.default = exports.loadSlice.reducer;
