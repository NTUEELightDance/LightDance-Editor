/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LoadState, LoadType } from "../types/loadSlice";
import {
  LightPresetsType,
  PosPresetsType
} from "../components/Presets/presets";
import { RootState, AppDispatch } from "../store/index";

import { log } from "core/utils";

const initialState: LoadState = {
  init: false,
  music: "",
  load: {} as LoadType,
  lightPresets: [],
  posPresets: [],
  dancerMap: {}
};
export const loadSlice = createSlice({
  name: "load",
  initialState,
  reducers: {
    setInit: (state) => {
      state.init = true;
    },
    setLoad: (state, action: PayloadAction<LoadType>) => {
      state.load = action.payload;
    },
    setMusic: (state, action: PayloadAction<string>) => {
      state.music = action.payload;
    },
    setLightPresets: (state, action: PayloadAction<LightPresetsType>) => {
      state.lightPresets = action.payload;
    },
    setPosPresets: (state, action: PayloadAction<PosPresetsType>) => {
      state.posPresets = action.payload;
    },
    setDancerMap: (state, action) => {
      state.dancerMap = action.payload;
    }
  }
});

const {
  setInit,
  setLoad,
  setMusic,
  setLightPresets,
  setPosPresets,
  setDancerMap
} = loadSlice.actions;

export const selectLoad = (state: RootState) => state.load;

const fetchJson = async (path: string) => {
  return await fetch(path).then(async (data) => await data.json());
};

export const fetchLoad = () => async (dispatch: AppDispatch) => {
  const load = await fetchJson("/data/load.json");
  log("load", load);
  const { Music, LightPresets, PosPresets, DancerMap } = load;
  // set load
  dispatch(setLoad(load));
  // set Music
  dispatch(setMusic(Music));
  // set lightPresets
  const lightPresets = await fetchJson(LightPresets);
  dispatch(setLightPresets(lightPresets));
  // set lightPresets
  const posPresets = await fetchJson(PosPresets);
  dispatch(setPosPresets(posPresets));
  // set DancerMap
  dispatch(setDancerMap(DancerMap));
  // finish, set Init
  dispatch(setInit());
};

export default loadSlice.reducer;
