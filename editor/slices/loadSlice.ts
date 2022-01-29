/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  loadState,
  textureType,
  loadType,
  DancersType,
} from "../types/loadSlice";
import {
  ControlMapType,
  ControlRecordType,
  posRecordType,
  lightPresetsType,
  posPresetsType,
  EffectRecordMapType,
  EffectStatusMapType,
} from "../types/globalSlice";
import { RootState, AppDispatch } from "../store/index";

const initialState: loadState = {
  init: false,
  music: "",
  load: {} as loadType,
  control: [],
  controlMap: {},
  position: [],
  lightPresets: [],
  posPresets: [],
  effectRecordMap: {},
  effectStatusMap: {},
  texture: {} as textureType,
  dancers: {},
  dancerNames: [],
};
export const loadSlice = createSlice({
  name: "load",
  initialState,
  reducers: {
    setInit: (state) => {
      state.init = true;
    },
    setLoad: (state, action: PayloadAction<loadType>) => {
      state.load = action.payload;
    },
    setMusic: (state, action: PayloadAction<string>) => {
      state.music = action.payload;
    },
    setControl: (state, action: PayloadAction<ControlRecordType>) => {
      state.control = action.payload;
    },
    setControlMap: (state, action: PayloadAction<ControlMapType>) => {
      state.controlMap = action.payload;
    },
    setPosition: (state, action: PayloadAction<posRecordType>) => {
      state.position = action.payload;
    },
    setLightPresets: (state, action: PayloadAction<lightPresetsType>) => {
      state.lightPresets = action.payload;
    },
    setPosPresets: (state, action: PayloadAction<posPresetsType>) => {
      state.posPresets = action.payload;
    },
    setEffectRecordMap: (state, action: PayloadAction<EffectRecordMapType>) => {
      state.effectRecordMap = action.payload;
    },
    setEffectStatusMap: (state, action: PayloadAction<EffectStatusMapType>) => {
      state.effectStatusMap = action.payload;
    },
    setTexture: (state, action: PayloadAction<textureType>) => {
      state.texture = action.payload;
    },
    setDancers: (state, action: PayloadAction<DancersType>) => {
      state.dancers = action.payload;
    },
    setDancerNames: (state, action: PayloadAction<string[]>) => {
      state.dancerNames = action.payload;
    },
  },
});

const {
  setInit,
  setLoad,
  setMusic,
  setControl,
  setControlMap,
  setPosition,
  setLightPresets,
  setPosPresets,
  setEffectRecordMap,
  setEffectStatusMap,
  setTexture,
  setDancers,
  setDancerNames,
} = loadSlice.actions;

export const selectLoad = (state: RootState) => state.load;

const fetchJson = (path: string) => {
  return fetch(path).then((data) => data.json());
};

export const fetchLoad = () => async (dispatch: AppDispatch) => {
  const load = await fetchJson("/data/load.json");
  const {
    Music,
    Control,
    ControlMap,
    Position,
    LightPresets,
    PosPresets,
    EffectRecordMap,
    EffectStatusMap,
    Dancers,
    Texture,
  } = load;
  // set load
  dispatch(setLoad(load));
  // set Music
  dispatch(setMusic(Music));
  // set Control
  const control = await fetchJson(Control);
  dispatch(setControl(control));
  // set ControlMap
  const controlMap = await fetchJson(ControlMap);
  dispatch(setControlMap(controlMap));
  // set Position
  const position = await fetchJson(Position);
  dispatch(setPosition(position));
  // set lightPresets
  const lightPresets = await fetchJson(LightPresets);
  dispatch(setLightPresets(lightPresets));
  // set lightPresets
  const posPresets = await fetchJson(PosPresets);
  dispatch(setPosPresets(posPresets));
  // set effectRecordMap
  const effectRecordMap = await fetchJson(EffectRecordMap);
  dispatch(setEffectRecordMap(effectRecordMap));
  // set effectStatusMap
  const effectStatusMap = await fetchJson(EffectStatusMap);
  dispatch(setEffectStatusMap(effectStatusMap));
  // set Dancer Names
  dispatch(setDancerNames(Dancers.names));

  const dancers: DancersType = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const name of Dancers.names) {
    // eslint-disable-next-line no-await-in-loop
    dancers[name] = await fetchJson(
      `${Dancers.prefix}${name}${Dancers.postfix}`
    );
  }
  dispatch(setDancers(dancers));
  // set Textures
  const texture = await fetchJson(Texture);
  dispatch(setTexture(texture));
  // finish, set Init
  dispatch(setInit());
};

export default loadSlice.reducer;
