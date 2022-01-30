/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
	CommandState,
	DancerStatusType,
	BoardConfigType,
} from "../types/commandSlice";
import { RootState, AppDispatch } from "../store/index";

const initialState: CommandState = {
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
		setPlay: (state, action: PayloadAction<boolean>) => {
			state.play = action.payload;
		},
		setStop: (state, action: PayloadAction<boolean>) => {
			state.stop = action.payload;
			state.play = false;
		},
		startPlay: (
			state,
			action: PayloadAction<{ startTime: number; sysTime: number }>
		) => {
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
		initDancerStatus: (state, action: PayloadAction<BoardConfigType>) => {
			const boardConfig = action.payload;
			const newDancerStatus: DancerStatusType = {};
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
		updateDancerStatus: (
			state,
			action: PayloadAction<{
				dancerName: string;
				newStatus: {
					OK: boolean;
					msg: string;
					isConnected: boolean;
					ip: string;
				};
			}>
		) => {
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
		clearDancerStatusMsg: (
			state,
			action: PayloadAction<{ dancerNames: string[] }>
		) => {
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

export const selectCommand = (state: RootState) => state.command;

const fetchJson = (path: string) => {
	return fetch(path).then((data) => data.json());
};

export const fetchBoardConfig = () => async (dispath: AppDispatch) => {
	const boardConfig = await fetchJson("/data/board_config.json");

	dispath(initDancerStatus(boardConfig));
};

export default commandSlice.reducer;
