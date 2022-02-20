import { useState } from "react";
// mui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
// actions
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
// constants
import { IDLE, EDITING } from "constants";
// hooks
import useEditHandler from "hooks/useEditHandler";
import { useHotkeys } from "react-hotkeys-hook";

/**
 * TODO: Need beautify, and maybe the buttons may not be here in the future
 */
export default function EditButtons() {
  const mode = useReactiveVar(reactiveState.editMode);

  const [loading, setLoading] = useState(false);

  const {
    handleStartEditing,
    handleSave,
    handleCancel,
    handleAdd,
    handleDelete,
  } = useEditHandler();

  useHotkeys("e", () => {
    handleStartEditing();
  });
  useHotkeys("a", () => {
    handleClickAdd();
  });
  useHotkeys("del", () => {
    handleClickDelete();
  });
  useHotkeys("esc", () => {
    handleCancel();
  });
  useHotkeys(
    "ctrl+s, cmd+s",
    (e) => {
      e.preventDefault();
      // Save can only be triggered in EDITING mode
      if (mode === EDITING) handleClickSave();
    },
    [mode]
  );

  const handleClickSave = async () => {
    setLoading(true);
    await handleSave();
    setLoading(false);
  };
  const handleClickAdd = async () => {
    setLoading(true);
    await handleAdd();
    setLoading(false);
  };
  const handleClickDelete = async () => {
    setLoading(true);
    await handleDelete();
    setLoading(false);
  };

  function SaveButton() {
    return (
      <Button
        variant="outlined"
        size="small"
        color="primary"
        onClick={handleClickSave}
      >
        SAVE
      </Button>
    );
  }

  function EditButton() {
    return (
      <Button
        variant="outlined"
        size="small"
        color="primary"
        onClick={handleStartEditing}
      >
        EDIT
      </Button>
    );
  }

  function DeleteButton() {
    return (
      <Button
        variant="outlined"
        size="small"
        color="error"
        onClick={handleClickDelete}
      >
        DEL
      </Button>
    );
  }

  function CancelButton() {
    return (
      <Button
        variant="outlined"
        size="small"
        color="error"
        onClick={handleCancel}
      >
        CANCEL
      </Button>
    );
  }

  function AddButton() {
    return (
      <Button
        variant="outlined"
        size="small"
        color="primary"
        onClick={handleClickAdd}
      >
        ADD
      </Button>
    );
  }

  function LoadingBtn() {
    return (
      <LoadingButton
        loading
        variant="outlined"
        size="small"
        sx={{
          "&.MuiLoadingButton-loading": {
            border: "0.5px solid rgba(255, 255, 255, 0.4)",
          },
          "&.MuiLoadingButton-loading>.MuiLoadingButton-loadingIndicator": {
            color: "rgba(255, 255, 255, 0.4)",
          },
        }}
      >
        load
      </LoadingButton>
    );
  }

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
      }}
    >
      {loading ? (
        <LoadingBtn />
      ) : (
        <>
          {mode === IDLE ? (
            <>
              <AddButton />
              <EditButton />
            </>
          ) : (
            <>
              <SaveButton />
              <CancelButton />
            </>
          )}
          {mode === IDLE && <DeleteButton />}
        </>
      )}
    </Box>
  );
}
