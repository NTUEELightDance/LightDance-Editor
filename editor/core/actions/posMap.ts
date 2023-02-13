import { registerActions } from "../registerActions";
import type { PosMap, State } from "../models";

const actions = registerActions({
  setPosMap: (state: State, payload: PosMap) => {
    state.posMap = payload;
  },
});

export const { setPosMap } = actions;
