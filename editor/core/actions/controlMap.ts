import { registerActions } from "../registerActions";
import type { ControlMap, State } from "../models";

const actions = registerActions({
  setControlMap: (state: State, payload: ControlMap) => {
    state.controlMap = payload;
  },
});

export const { setControlMap } = actions;
