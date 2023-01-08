import { registerActions } from "../registerActions";
// types
import { State, EditMode, Editor, EditingData } from "../models";
// constants
import { CONTROL_EDITOR, EDITING, IDLE, POS_EDITOR } from "@/constants";
import { getControl, getPos, deleteColorCode } from "../utils";
// api
import { controlAgent, posAgent } from "api";

import _ from "lodash";

import { notification, updateFrameByTimeMap } from "core/utils";

/**
 * This is a helper function for getting data from pos and map
 * @param state
 * @returns { map, record, index, frameId, frame, agent, fade? }
 */
const getDataHandler = async (state: State) => {
  const [controlMap, controlRecord] = await getControl();
  const [posMap, posRecord] = await getPos();

  const pureStatus = deleteColorCode(state.currentStatus);

  if (state.editor === CONTROL_EDITOR) {
    // get the right frameIndex due to the multiple editing issue
    const frameIndex = updateFrameByTimeMap(
      controlRecord,
      controlMap,
      state.currentControlIndex,
      state.currentTime
    );
    return {
      map: controlMap,
      record: controlRecord,
      index: frameIndex,
      frameId: controlRecord[frameIndex],
      frame: pureStatus,
      agent: controlAgent,
      fade: state.currentFade,
    };
  } else {
    // get the right frameIndex due to the multiple editing issue
    const frameIndex = updateFrameByTimeMap(
      posRecord,
      posMap,
      state.currentPosIndex,
      state.currentTime
    );
    return {
      map: posMap,
      record: posRecord,
      index: frameIndex,
      frameId: posRecord[frameIndex],
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
  setEditMode: (state: State, payload: EditMode) => {
    state.editMode = payload;
  },

  /**
   * Set current editor, should be CONTROL_EDITOR or POS_EDITOR
   * @param state
   * @param payload
   */
  setEditor: (state: State, payload: Editor) => {
    state.editor = payload;
  },

  /**
   * Set current editor, should be CONTROL_EDITOR or POS_EDITOR
   * @param state
   * @param payload
   */
  toggleEditor: (state: State) => {
    switch (state.editor) {
      case CONTROL_EDITOR:
        state.editor = POS_EDITOR;
        break;
      case POS_EDITOR:
        state.editor = CONTROL_EDITOR;
        break;
    }
  },

  /**
   * Set current editing data, including the index, start and id
   * @param state
   * @param payload
   */
  setEditingData: (state: State, payload: EditingData) => {
    state.editingData = { ...payload };
  },

  /**
   * Start editing, request api to tell backend someone is editing the frame
   */
  startEditing: async (state: State) => {
    const { map, index, frameId, agent } = await getDataHandler(state);
    state.editingData = {
      start: map[frameId].start,
      frameId,
      index,
    };
    const isPermitted = await agent.requestEditPermission(frameId);
    if (!isPermitted) {
      notification.error("Permission denied");
      return;
    }
    state.editMode = EDITING;
  },

  /**
   * Save the currentFrame (status or pos), request api
   * @param payload: a boolean, indicating whether to edit the start time or not
   */
  save: async (state: State, payload: boolean) => {
    const { frame, agent, fade } = await getDataHandler(state);
    // save the frameId which request for editing
    const frameId = state.editingData.frameId;
    const requestTimeChange = payload;
    await agent.saveFrame(
      frameId,
      frame,
      state.currentTime,
      requestTimeChange,
      fade
    );
  },

  /**
   * Cancel the editing status
   */
  cancelEditing: async (state: State) => {
    const { frameId, agent } = await getDataHandler(state);
    const isCancelled = await agent.cancelEditPermission(frameId);
    if (isCancelled) {
      cancelEditMode();
    } else notification.error("Cancel Permission Error");
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

  cancelEditMode: (state: State) => {
    state.editMode = IDLE;
  },
});

export const {
  setEditMode,
  setEditor,
  toggleEditor,
  setEditingData,
  startEditing,
  save,
  cancelEditing,
  add,
  deleteCurrent,
  cancelEditMode,
} = actions;
