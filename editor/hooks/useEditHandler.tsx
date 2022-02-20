// states and actions
import { reactiveState } from "core/state";

import {
  startEditing,
  save,
  cancelEditing,
  add,
  deleteCurrent,
  setCurrentTime,
} from "core/actions";
//constants
import { CONTROL_EDITOR, POS_EDITOR } from "constants";
export default function useEditHandler() {
  // Enter editing mode (request edit)
  const handleStartEditing = async () => {
    await startEditing();
  };

  // Save, exist editing mode
  const handleSave = async () => {
    const editingData = reactiveState.editingData();
    const currentTime = reactiveState.currentTime();

    let requestTimeChange = false;
    if (editingData.start !== currentTime) {
      if (
        confirm(
          `You have modify the time, do you want to change the time from ${editingData.start} to ${currentTime}?`
        )
      ) {
        requestTimeChange = true;
      }
    }
    await save({ payload: requestTimeChange });
    await cancelEditing();
  };

  // Cancel the edit, exist editing mode
  const handleCancel = async () => {
    await cancelEditing({});
    // reset the frame
    await setCurrentTime({ payload: reactiveState.currentTime() }); // reset the timeData
  };

  // Add a frame, use currentPos as default
  const handleAdd = async () => {
    await add();
    await setCurrentTime({ payload: reactiveState.currentTime() }); // reset the timeData
  };

  // Delete the current record
  const handleDelete = async () => {
    const controlFrameIndex = reactiveState.currentControlIndex();
    const posFrameIndex = reactiveState.currentPosIndex();
    const editor = reactiveState.editor();
    if (
      (editor === CONTROL_EDITOR && controlFrameIndex === 0) ||
      (editor === POS_EDITOR && posFrameIndex === 0)
    ) {
      alert("Cannot delete initial frame");
      return;
    }
    if (confirm("Are you sure you want to delete the frame?")) {
      await deleteCurrent();
      await setCurrentTime({ payload: reactiveState.currentTime() }); // reset the timeData
    }
  };

  return {
    handleStartEditing,
    handleSave,
    handleCancel,
    handleAdd,
    handleDelete,
  };
}
