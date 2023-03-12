import { useState } from "react";

import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";

import Box from "@mui/material/Box";
import { AddButton, CancelButton, DeleteButton, SaveButton } from "./Buttons";

import {
  addFrameToCurrentLEDEffect,
  deleteCurrentFrameFromCurrentLEDEffect,
  cancelEditLEDEffect,
  saveLEDEffect,
} from "@/core/actions";
import { notification } from "@/core/utils";
import { LoadingButton } from "@mui/lab";

function LEDEditButton() {
  const editorState = useReactiveVar(reactiveState.editorState);
  const [saving, setSaving] = useState(false);

  const handleAddFrame = async () => {
    try {
      await addFrameToCurrentLEDEffect();
      notification.success("Frame added");
    } catch (err) {
      notification.error((err as Error).message);
    }
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
    setSaving(true);
    try {
      await saveLEDEffect();
      notification.success("Saved LED effect");
    } catch {
      notification.error("Error saving LED effect");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    cancelEditLEDEffect();
  };

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        gap: "1em",
      }}
    >
      {editorState === "EDITING" ? (
        <>
          {saving ? <LoadingButton /> : <SaveButton onClick={handleSave} />}
          <CancelButton onClick={handleCancel} />
          <AddButton onClick={handleAddFrame} />
          <DeleteButton onClick={handleDelete} />
        </>
      ) : (
        <></>
      )}
    </Box>
  );
}

export default LEDEditButton;
