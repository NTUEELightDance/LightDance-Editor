import { registerActions } from "../registerActions";
// types
import { State, DancersType, PartTypeMapType } from "../models";

const actions = registerActions({
  /**
   * Set dancer names
   */
  setDancerNames(state: State, payload: string[]) {
    state.dancerNames = payload;
  },
  /**
   * Set dancers
   */
  setDancers(state: State, payload: DancersType) {
    state.dancers = payload;
  },
  /**
   * Set partTypeMap
   */
  setPartTypeMap(state: State, payload: PartTypeMapType) {
    state.partTypeMap = payload;
  },
});

export const { setDancerNames, setDancers, setPartTypeMap } = actions;
