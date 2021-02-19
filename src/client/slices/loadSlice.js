import { createSlice } from "@reduxjs/toolkit";

export const loadSlice = createSlice({
  name: "load",
  initialState: {
    init: false,
    music: "",
    control: [],
    position: [],
    presets: "",
    texture: {},
    dancers: {}, // name: data, data will be load next
    dancerNames: {}, // [name]
  },
  reducers: {
    setInit: (state) => {
      state.init = true;
    },
    setMusic: (state, action) => {
      state.music = action.payload;
    },
    setControl: (state, action) => {
      state.control = action.payload;
    },
    setPosition: (state, action) => {
      state.position = action.payload;
    },
    setPresets: (state, action) => {
      state.presets = action.payload;
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
  setMusic,
  setControl,
  setPosition,
  setPresets,
  setTexture,
  setDancers,
  setDancerNames,
} = loadSlice.actions;

export const selectLoad = (state) => state.load;

const fetchJson = (path) => {
  return fetch(path).then((data) => data.json());
};

export const fetchLoad = () => async (dispatch) => {
  const {
    Music,
    Control,
    Position,
    Presets,
    Dancers,
    Texture,
  } = await fetchJson("/data/load.json");
  // set Music
  dispatch(setMusic(Music));
  // set Control
  const control = await fetchJson(Control);
  dispatch(setControl(control));
  // set Position
  const position = await fetchJson(Position);
  dispatch(setPosition(position));
  // set Presets
  // TODO
  // const preset = await fetchJson(Presets);
  // dispatch(setPresets(presets));
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
  dispatch(setTexture(Texture));
  // finish, set Init
  dispatch(setInit());
};

export default loadSlice.reducer;
