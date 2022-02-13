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
    await cancelEditing();
    // reset the frame
    await setCurrentTime({ payload: reactiveState.currentTime() });
  };

  // Add a frame, use currentPos as default
  const handleAdd = async () => {
    await add();
  };

  // Delete the current record
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete the frame?")) {
      deleteCurrent();
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
