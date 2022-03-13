// states and actions
import { reactiveState } from "core/state";

import {
  startEditing,
  save,
  cancelEditing,
  add,
  deleteCurrent,
  setCurrentTime,
  generateLedEffectRecord,
} from "core/actions";
//constants
import { CONTROL_EDITOR, POS_EDITOR } from "constants";

import { notification, confirmation, formatDisplayedTime } from "core/utils";

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
        await confirmation.info(
          `You have modify the time, do you want to change the time from ${editingData.start} to ${currentTime}?`
        )
      ) {
        requestTimeChange = true;
      }
    }
    try {
      await save({ payload: requestTimeChange });
      notification.success("Save frame completed!");
    } catch (error) {
      notification.error((error as Error).message);
    }

    cancelEditing();

    // regenerate ledeffect after saving
    generateLedEffectRecord();
  };

  // Cancel the edit, exist editing mode
  const handleCancel = async () => {
    await cancelEditing({});
    // reset the frame
    await setCurrentTime({ payload: reactiveState.currentTime() }); // reset the timeData
  };

  // Add a frame, use currentPos as default
  const handleAdd = async () => {
    try {
      await add();
      setCurrentTime({ payload: reactiveState.currentTime() }); // reset the timeData
      notification.success(
        `Successfully added a frame at ${formatDisplayedTime(
          reactiveState.currentTime()
        )}`
      );
    } catch (error) {
      notification.error((error as Error).message);
    }
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
      notification.error("Cannot delete initial frame");
      return;
    }
    if (
      await confirmation.warning("Are you sure you want to delete the frame?")
    ) {
      await deleteCurrent();
      setCurrentTime({ payload: reactiveState.currentTime() }); // reset the timeData
      notification.success(
        `Successfully deleted the frame at ${formatDisplayedTime(
          reactiveState.currentTime()
        )}`
      );
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
