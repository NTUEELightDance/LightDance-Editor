// mui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
// actions
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
// constants
import { IDLE, EDITING } from "constants";
// hooks
import useEditHandler from "hooks/useEditHandler";

/**
 * TODO: Need beautify, and maybe the buttons may not be here in the future
 */
export default function EditButtons() {
  const mode = useReactiveVar(reactiveState.editMode);

  const {
    handleStartEditing,
    handleSave,
    handleCancel,
    handleAdd,
    handleDelete,
  } = useEditHandler();

  function SaveButton() {
    return (
      <Button
        variant="outlined"
        size="small"
        color="primary"
        onClick={handleSave}
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
        onClick={handleDelete}
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
        onClick={handleAdd}
      >
        ADD
      </Button>
    );
  }

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
      }}
    >
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
    </Box>
  );
}
