import { cloneDeep } from "lodash";
import { registerActions } from "../registerActions";
// types
import type { State, PosMapStatus } from "../models";
import { getPos, interpolatePos } from "../utils";

const actions = registerActions({
  /**
   * Set current pos By Name
   * @param {State} state
   * @param {object} payload - new dancer's pos
   */
  setCurrentPosByName: (
    state: State,
    payload: {
      name: string;
      x: number;
      y: number;
      z: number;
    }
  ) => {
    const { name, x, y, z } = payload;
    if (!state.currentPos[name]) {
      throw new Error(
        `[Error] setCurrentPos, invalid parameter(name), ${name}`
      );
    }
    if (
      typeof x !== "number" ||
      typeof y !== "number" ||
      typeof z !== "number"
    ) {
      throw new Error(
        `[Error] setCurrentPos, invalid parameter(x, y, z) ${x}, ${y}, ${z}`
      );
    }

    state.currentPos = cloneDeep(state.currentPos);
    state.currentPos[name] = { x, y, z };
    pushPosStack();
  },

  /**
   * set current pos
   * @param {State} state
   * @param {*} payload - new pos
   */
  setCurrentPos: (state: State, payload: PosMapStatus) => {
    state.currentPos = payload;
    pushPosStack();
  },

  /**
   * set current pos to ground
   * @param {State} state
   */
  setCurrentPosToGround: (state: State) => {
    Object.keys(state.currentPos).forEach((dancerName) => {
      state.currentPos[dancerName].y = 0;
    });
  },

  syncCurrentPosWithPosMap: async (state: State) => {
    const [posMap, posRecord] = await getPos();

    const posIndex = state.currentPosIndex;
    const time = state.currentTime;
    console.log("posIndex", posIndex);
    console.log("time", time);
    // position interpolation
    if (posIndex === posRecord.length - 1) {
      // can't interpolation
      state.currentPos = posMap[posRecord[posIndex]].pos;
    } else {
      // do interpolation
      state.currentPos = interpolatePos(
        time,
        posMap[posRecord[posIndex]],
        posMap[posRecord[posIndex + 1]]
      );
    }
  },

  pushPosStack: (state: State) => {
    if (state.posStack.length - 1 !== state.posStackIndex) {
      state.posStack = state.posStack.slice(0, state.posStackIndex + 1);
    }
    if (state.posStack[state.posStackIndex] === state.currentPos) return;
    state.posStack.push(cloneDeep(state.currentPos));
    state.posStackIndex += 1;
  },

  initPosStack: (state: State) => {
    state.posStack = [cloneDeep(state.currentPos)];
    state.posStackIndex = 0;
  },

  IncrementPosStackIndex: (state: State) => {
    state.posStackIndex += 1;
    state.currentPos = state.posStack[state.posStackIndex];
  },

  DecrementPosStackIndex: (state: State) => {
    state.posStackIndex -= 1;
    state.currentPos = state.posStack[state.posStackIndex];
  },
});

export const {
  setCurrentPosByName,
  setCurrentPos,
  setCurrentPosToGround,
  syncCurrentPosWithPosMap,
  pushPosStack,
  initPosStack,
  IncrementPosStackIndex,
  DecrementPosStackIndex,
} = actions;
