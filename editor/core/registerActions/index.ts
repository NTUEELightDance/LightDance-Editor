import { state, syncReactiveState } from "../state";
import { State } from "../models";
// observers
import { waveSurferAppInstance } from "../../components/Wavesurfer/WaveSurferApp";
import controller from "../../components/Simulator/Controller";
import { threeController } from "../../components/ThreeSimulator/ThreeController";
/**
 * A mapping of actionName to the wrapped action.
 */
interface WrappedActionRegistry {
  [key: string]: (payloadOptions?: PayloadOptions) => Promise<void>;
}

/**
 * PayloadOptions
 */
interface PayloadOptions {
  payload?: Payload;
  options?: Options;
}

type Payload = any;

/**
 * Options for determining whether to rerender or simulate after completing the action.
 */
interface Options {
  rerender?: boolean; // to rerender React components
  states?: string[]; // rerender according the states. If rerender but emtpy states, we will rerender the changed states automatically

  refreshWavesurfer?: boolean;
  refreshPixiSimulator?: boolean;
  refreshThreeSimulator?: boolean;
}

/**
 * Action function interface
 * An action will manipulate the states.
 * The action will be wrapped by actionCreator and saved in wrappedActionRegistry.
 */
interface Action {
  (state: State, payload: Payload): void;
}

/**
 * Default options for the action
 */
const defaultOptions = {
  rerender: true,
  states: [],

  refreshWavesurfer: true,
  refreshPixiSimulator: true,
  refreshThreeSimulator: true,
};

/**
 * An action creator will create a action with options.
 * @param action functions with two parameters, state and payload
 * @returns a function with two parameters, payload and options
 */
function actionCreator(action: Action) {
  return async (payloadOptions?: PayloadOptions) => {
    await action(state, payloadOptions?.payload);
    const options = { ...defaultOptions, ...payloadOptions?.options };
    // console.debug("payload", payloadOptions?.payload);
    // console.debug("options:", options);
    // console.debug("state", JSON.parse(JSON.stringify(state)));
    if (options.rerender) {
      // request rerender
      // TODO: detect which variable changes
      syncReactiveState(options.states);
    }

    // TODO: these are hard coded
    // 3rd-party rerender
    if (options.refreshWavesurfer) {
      console.debug("refreshWavesurfer");
      waveSurferAppInstance.seekTo(state.currentTime);
    }
    if (options.refreshThreeSimulator && threeController.isInitialized()) {
      console.debug("refreshThreeSimulator");
      threeController.updateDancersPos(state.currentPos);
      threeController.updateDancersStatus(state.currentStatus);
      threeController.render();
    }
    if (options.refreshPixiSimulator && controller.isInitialized()) {
      console.debug("refreshPixiSimulator");
      controller.updateDancersPos(state.currentPos);
      controller.updateDancersStatus(state.currentStatus);
    }
  };
}

/**
 * Register the actions to the local action registry.
 * @param actions
 * @returns
 */
export function registerActions(actions: { [key: string]: Action }) {
  // Registry that stores all the actions.
  const wrappedActionRegistry: WrappedActionRegistry = {};
  Object.keys(actions).forEach((actionName: string) => {
    if (actionName in wrappedActionRegistry) {
      throw new Error("The action has been registered !");
    }
    wrappedActionRegistry[actionName] = actionCreator(actions[actionName]);
  });
  console.debug(wrappedActionRegistry);
  return wrappedActionRegistry;
}
