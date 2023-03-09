import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";

import Box from "@mui/material/Box";
import {
  AddButton,
  CancelButton,
  DeleteButton,
  EditButton,
  LoadingButton,
  SaveButton,
} from "./Buttons";

import {
  addFrameToCurrentLEDEffect,
  deleteCurrentFrameFromCurrentLEDEffect,
  saveCurrentLEDEffectFrame,
  startEditingLED,
  cancelEditMode,
} from "@/core/actions";
import { confirmation, notification } from "@/core/utils";

function LEDEditButton() {
  const editorState = useReactiveVar(reactiveState.editorState);

  const loading = {
    save: false,
    add: false,
    delete: false,
  };

  const handleAddFrame = async () => {
    try {
      await addFrameToCurrentLEDEffect();
      notification.success("Frame added");
    } catch (err) {
      notification.error((err as Error).message);
    }
  };

  const handleEdit = () => {
    startEditingLED();
  };

  const handleDelete = async () => {
    try {
      await deleteCurrentFrameFromCurrentLEDEffect();
      notification.success("Frame deleted");
    } catch (err) {
      notification.error((err as Error).message);
    }
  };

  const handleSave = async () => {
    const currentTime = reactiveState.currentTime();
    const editingData = reactiveState.editingData();

    const requestTimeChange =
      currentTime !== editingData.start &&
      (await confirmation.info(
        `You have modify the time, do you want to change the time from ${editingData.start} to ${currentTime}?`
      ));

    saveCurrentLEDEffectFrame({ payload: requestTimeChange });
  };

  const handleCancel = () => {
    cancelEditMode();
  };

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        gap: "1em",
      }}
    >
      {editorState === "IDLE" ? (
        <>
          {loading.add ? (
            <LoadingButton />
          ) : (
            <AddButton onClick={handleAddFrame} />
          )}

          <EditButton onClick={handleEdit} />

          {loading.delete ? (
            <LoadingButton />
          ) : (
            <DeleteButton onClick={handleDelete} />
          )}
        </>
      ) : (
        <>
          {loading.save ? (
            <LoadingButton />
          ) : (
            <SaveButton onClick={handleSave} />
          )}

          <CancelButton onClick={handleCancel} />
        </>
      )}
    </Box>
  );
}

export default LEDEditButton;
