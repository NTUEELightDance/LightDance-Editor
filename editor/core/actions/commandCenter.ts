import type { DraftFunction } from "use-immer";
import { registerActions } from "../registerActions";
// types
import { RPiStatus, State } from "../models";

const actions = registerActions({
  /**
   * ColorMap
   * @param {State} state
   * @param {ColorMap} payload
   */
  setRPiStatus: (state: State, payload: DraftFunction<RPiStatus>) => {
    const newRPiStatus = state.RPiStatus;
    payload(newRPiStatus);

    state.RPiStatus = newRPiStatus;
  },
});

export const { setRPiStatus } = actions;
