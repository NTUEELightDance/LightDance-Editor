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

  pushShellHistory: (
    state: State,
    payload: {
      dancer: string;
      command: string;
      output: string;
    }
  ) => {
    const { dancer, command, output } = payload;
    const newShellHistory = state.shellHistory;
    newShellHistory[dancer] ??= [];
    newShellHistory[dancer].push({ command, output });
    state.shellHistory = newShellHistory;
  },
});

export const { setRPiStatus, pushShellHistory } = actions;
