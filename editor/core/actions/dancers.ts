import { registerActions } from "../registerActions";
// types
import { State, Dancers, PartTypeMap } from "../models";

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
  setDancers(state: State, payload: Dancers) {
    state.dancers = payload;
  },
  /**
   * Set partTypeMap
   */
  setPartTypeMap(state: State, payload: PartTypeMap) {
    state.partTypeMap = payload;
  },
});

export const { setDancerNames, setDancers, setPartTypeMap } = actions;
