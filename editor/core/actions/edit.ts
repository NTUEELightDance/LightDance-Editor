import { registerActions } from "../registerActions";
// types
import { State, EditModeType, EditorType, EditingDataType } from "../models";
// constants
import { CONTROL_EDITOR, EDITING, IDLE } from "constants";
import { getControl, getPos } from "../utils";
// api
import { controlAgent, posAgent } from "api";
// other actions
import { setCurrentTime } from "./timeData";
import { is } from "immer/dist/internal";

/**
 * This is a helper function for getting data from pos and map
 * @param state
 * @returns { map, record, index, frameId, frame, agent, fade? }
 */
const getDataHandler = async (state: State) => {
  const [controlMap, controlRecord] = await getControl();
  const [posMap, posRecord] = await getPos();

  if (state.editor === CONTROL_EDITOR) {
    return {
      map: controlMap,
      record: controlRecord,
      index: state.currentControlIndex,
      frameId: controlRecord[state.currentControlIndex],
      frame: state.currentStatus,
      agent: controlAgent,
      fade: state.currentFade,
    };
  } else {
    return {
      map: posMap,
      record: posRecord,
      index: state.currentPosIndex,
      frameId: posRecord[state.currentPosIndex],
      frame: state.currentPos,
      agent: posAgent,
    };
  }
};

const actions = registerActions({
  /**
   * Set editMode
   * @param state
   * @param payload
   */
  setEditMode: (state: State, payload: EditModeType) => {
    state.editMode = payload;
  },

  /**
   * Set current editor, should be CONTROL_EDITOR or POS_EDITOR
   * @param state
   * @param payload
   */
  setEditor: (state: State, payload: EditorType) => {
    state.editor = payload;
  },

  /**
   * Set current editing data, including the index, start and id
   * @param state
   * @param payload
   */
  setEditingData: (state: State, payload: EditingDataType) => {
    state.editingData = { ...payload };
  },

  /**
   * Start editing, request api to tell backend someone is editing the frame
   */
  startEditing: async (state: State) => {
    const { map, index, frameId, agent } = await getDataHandler(state);
    // state.editingData = {
    //   start: map[frameId].start,
    //   frameId,
    //   index,
    // };
    const isPermitted = await agent.requestEditPermission(frameId);
    if (!isPermitted) {
      alert("Permission denied");
      return;
    }
    state.editMode = EDITING;
  },

  /**
   * Save the currentFrame (status or pos), request api
   * @param payload: a boolean, indicating whether to edit the start time or not
   */
  save: async (state: State, payload: boolean) => {
    const { frameId, frame, agent, fade } = await getDataHandler(state);
    const requestTimeChange = payload;
    await agent.saveFrame(frameId, frame, state.currentTime, requestTimeChange, fade);
  },

  /**
   * Cancel the editing status
   */
  cancelEditing: async (state: State) => {
    const { frameId, agent } = await getDataHandler(state);
    const isCancelled = await agent.cancelEditPermission(frameId);
    if (isCancelled) {
      state.editMode = IDLE;
    } else alert("Cancel Permission Error");
  },

  /**
   * Add a frame to currentTime, use current frame (status or pos) as default
   */
  add: async (state: State) => {
    const { agent, frame, fade, index } = await getDataHandler(state);
    await agent.addFrame(frame, state.currentTime, index, fade);
  },

  /**
   * Delete current
   */
  deleteCurrent: async (state: State) => {
    const { frameId, agent } = await getDataHandler(state);
    await agent.deleteFrame(frameId);
  },
});

export const {
  setEditMode,
  setEditor,
  setEditingData,
  startEditing,
  save,
  cancelEditing,
  add,
  deleteCurrent,
} = actions;
