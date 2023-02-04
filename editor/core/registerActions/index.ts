import { state, syncReactiveState } from "../state";
import { State } from "../models";
// observers
import { waveSurferAppInstance } from "../../components/Wavesurfer/WaveSurferApp";
import { threeController } from "../../components/ThreeSimulator/ThreeController";

import { debug } from "core/utils";

/**
 * A mapping of actionName to the wrapped action.
 */
type WrappedActionRegistry = Record<string, (payloadOptions?: PayloadOptions) => Promise<void>>

/**
 * PayloadOptions
 */
interface PayloadOptions {
  payload?: Payload
  options?: Options
}

type Payload = any

/**
 * Options for determining whether to rerender or simulate after completing the action.
 */
interface Options {
  rerender?: boolean // to rerender React components
  states?: string[] // rerender according the states. If rerender but emtpy states, we will rerender the changed states automatically

  refreshWavesurfer?: boolean
  refreshThreeSimulator?: boolean
}

/**
 * Action function interface
 * An action will manipulate the states.
 * The action will be wrapped by actionCreator and saved in wrappedActionRegistry.
 */
type Action = (state: State, payload: Payload) => void

/**
 * Default options for the action
 */
const defaultOptions = {
  rerender: true,
  states: [],

  refreshWavesurfer: true,
  refreshThreeSimulator: true
};

/**
 * An action creator will create a action with options.
 * @param action functions with two parameters, state and payload
 * @returns a function with two parameters, payload and options
 */
function actionCreator (action: Action, actionName: string) {
  return async (payloadOptions?: PayloadOptions) => {
    await action(state, payloadOptions?.payload);
    const options = { ...defaultOptions, ...payloadOptions?.options };
    debug("actionName: ", actionName);
    debug("payload", payloadOptions?.payload);
    debug("options:", options);
    debug("state", state.toString());
    if (options.rerender) {
      // request rerender
      // TODO: detect which variable changes
      syncReactiveState(options.states);
    }

    // TODO: these are hard coded
    // 3rd-party rerender
    if (options.refreshWavesurfer) {
      debug("refreshWavesurfer");
      waveSurferAppInstance.seekTo(state.currentTime);
    }
    if (options.refreshThreeSimulator && threeController.isInitialized()) {
      debug("refreshThreeSimulator");
      threeController.updateDancersPos(state.currentPos);
      threeController.updateDancersStatus(state.currentStatus);
      threeController.render();
    }
  };
}

/**
 * Register the actions to the local action registry.
 * @param actions
 * @returns
 */
export function registerActions (actions: Record<string, Action>) {
  // Registry that stores all the actions.
  const wrappedActionRegistry: WrappedActionRegistry = {};
  Object.keys(actions).forEach((actionName: string) => {
    if (actionName in wrappedActionRegistry) {
      throw new Error("The action has been registered !");
    }
    wrappedActionRegistry[actionName] = actionCreator(
      actions[actionName],
      actionName
    );
  });
  debug(wrappedActionRegistry);
  return wrappedActionRegistry;
}
