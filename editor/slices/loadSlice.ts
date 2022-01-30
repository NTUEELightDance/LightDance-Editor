/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
	LoadState,
	TextureType,
	LoadType,
	DancersType,
} from "../types/loadSlice";
import {
	ControlMapType,
	ControlRecordType,
	PosRecordType,
<<<<<<< HEAD
	LightPresetsType,
	PosPresetsType,
	EffectRecordMapType,
	EffectStatusMapType,
=======
	PosMapType,
	LightPresetsType,
	PosPresetsType,
>>>>>>> new position format done
} from "../types/globalSlice";
import { RootState, AppDispatch } from "../store/index";

const initialState: LoadState = {
	init: false,
	music: "",
	load: {} as LoadType,
	control: [],
	controlMap: {},
	position: [],
<<<<<<< HEAD
	lightPresets: [],
	posPresets: [],
	effectRecordMap: {},
	effectStatusMap: {},
=======
	posMap: {},
	lightPresets: [],
	posPresets: [],
>>>>>>> new position format done
	texture: {} as TextureType,
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
		setLoad: (state, action: PayloadAction<LoadType>) => {
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
<<<<<<< HEAD
=======
		setPosMap: (state, action: PayloadAction<PosMapType>) => {
			state.posMap = action.payload;
		},
>>>>>>> new position format done
		setPosition: (state, action: PayloadAction<PosRecordType>) => {
			state.position = action.payload;
		},
		setLightPresets: (state, action: PayloadAction<LightPresetsType>) => {
			state.lightPresets = action.payload;
		},
		setPosPresets: (state, action: PayloadAction<PosPresetsType>) => {
			state.posPresets = action.payload;
		},
<<<<<<< HEAD
		setEffectRecordMap: (state, action: PayloadAction<EffectRecordMapType>) => {
			state.effectRecordMap = action.payload;
		},
		setEffectStatusMap: (state, action: PayloadAction<EffectStatusMapType>) => {
			state.effectStatusMap = action.payload;
		},
=======
>>>>>>> new position format done
		setTexture: (state, action: PayloadAction<TextureType>) => {
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
<<<<<<< HEAD
	setLightPresets,
	setPosPresets,
	setEffectRecordMap,
	setEffectStatusMap,
=======
	setPosMap,
	setLightPresets,
	setPosPresets,
>>>>>>> new position format done
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
<<<<<<< HEAD
		LightPresets,
		PosPresets,
		EffectRecordMap,
		EffectStatusMap,
=======
		PosMap,
		LightPresets,
		PosPresets,
>>>>>>> new position format done
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
<<<<<<< HEAD
=======
	// set PosMap
	const posMap = await fetchJson(PosMap);
	dispatch(setPosMap(posMap));
>>>>>>> new position format done
	// set lightPresets
	const lightPresets = await fetchJson(LightPresets);
	dispatch(setLightPresets(lightPresets));
	// set lightPresets
	const posPresets = await fetchJson(PosPresets);
	dispatch(setPosPresets(posPresets));
<<<<<<< HEAD
	// set effectRecordMap
	const effectRecordMap = await fetchJson(EffectRecordMap);
	dispatch(setEffectRecordMap(effectRecordMap));
	// set effectStatusMap
	const effectStatusMap = await fetchJson(EffectStatusMap);
	dispatch(setEffectStatusMap(effectStatusMap));
=======
>>>>>>> new position format done
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
