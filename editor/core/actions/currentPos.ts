import { cloneDeep } from "lodash";
import { registerActions } from "../registerActions";
// types
import { State, PosMapStatus } from "../models";

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
  },

  /**
   * set current pos
   * @param {State} state
   * @param {*} payload - new pos
   */
  setCurrentPos: (state: State, payload: PosMapStatus) => {
    state.currentPos = payload;
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
});

export const { setCurrentPosByName, setCurrentPos, setCurrentPosToGround } =
  actions;
