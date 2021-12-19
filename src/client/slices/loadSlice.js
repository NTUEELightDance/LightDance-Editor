/* eslint-disable no-param-reassign */
import { createSlice } from "@reduxjs/toolkit";

export const loadSlice = createSlice({
  name: "load",
  initialState: {
    init: false,
    music: "", // load music path
    load: {},
    control: [], // loaded control.json, may not be same as localStorage (this is for default)
    controlMap: {}, // loaded controlMap.json
    position: [], // loaded position.json, may not be same as localStorage (this is for default)
    lightPresets: [], // loaded lightPresets.json, may not be same as localStorage (this is for default)
    posPresets: [], // loaded lightPresets.json, may not be same as localStorage (this is for default)
    texture: {}, // loaded texture
    dancers: {}, // name: data, data is like content of 'dancer0.json'
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
      console.log(action.payload);
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

const {
  setInit,
  setLoad,
  setMusic,
  setControl,
  setControlMap,
  setPosition,
  setLightPresets,
  setPosPresets,
  setTexture,
  setDancers,
  setDancerNames,
} = loadSlice.actions;

export const selectLoad = (state) => state.load;

const fetchJson = (path) => {
  return fetch(path).then((data) => data.json());
};

export const fetchLoad = () => async (dispatch) => {
  const load = await fetchJson("/data/load.json");
  const {
    Music,
    Control,
    ControlMap,
    Position,
    LightPresets,
    PosPresets,
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
  // set Dancer Names
  dispatch(setDancerNames(Dancers.names));

  const dancers = {};
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
