// states and actions
import { reactiveState } from "@/core/state";

import {
  startEditing,
  save,
  cancelEditing,
  add,
  deleteCurrent,
  setCurrentTime,
  syncLEDEffectRecord,
  cancelEditMode,
} from "@/core/actions";
// constants
import { CONTROL_EDITOR, POS_EDITOR } from "@/constants";

import { notification, confirmation, formatDisplayedTime } from "@/core/utils";

export default function useEditHandler() {
  const resetTime = async () => {
    await setCurrentTime({ payload: reactiveState.currentTime() }); // reset the timeData
  };

  // Enter editing mode (request edit)
  const handleStartEditing = async () => {
    await startEditing();
  };

  // Save, exist editing mode
  const handleSave = async () => {
    const editingData = reactiveState.editingData();
    const currentTime = reactiveState.currentTime();

    const requestTimeChange =
      editingData.start !== currentTime &&
      (await confirmation.info(
        `You have modify the time, do you want to change the time from ${editingData.start} to ${currentTime}?`
      ));

    try {
      await save({ payload: requestTimeChange });
      notification.success("Save frame completed!");
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
    }
    // get to editMode
    cancelEditMode();

    // regenerate led effect after saving
    syncLEDEffectRecord();
  };

  // Cancel the edit, exist editing mode
  const handleCancel = async () => {
    await cancelEditing();
    // reset the frame
    await resetTime();
  };

  // Add a frame, use currentPos as default
  const handleAdd = async () => {
    try {
      await add();
      notification.success(
        `Successfully added a frame at ${formatDisplayedTime(
          reactiveState.currentTime()
        )}`
      );
      await resetTime();
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
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
