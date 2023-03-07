import { useImmer } from "use-immer";
// mui
import Box from "@mui/material/Box";
import {
  LoadingButton,
  AddButton,
  EditButton,
  DeleteButton,
  SaveButton,
  CancelButton,
} from "./Buttons";
// actions and states
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";
// constants
import { IDLE, EDITING } from "@/constants";
// hooks
import useEditHandler from "hooks/useEditHandler";
import { useHotkeys } from "react-hotkeys-hook";

export default function NormalEditButtons() {
  const editorState = useReactiveVar(reactiveState.editorState);

  const [loading, setLoading] = useImmer({
    save: false,
    add: false,
    delete: false,
  });

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
    "ctrl+s, meta+s",
    (e) => {
      e.preventDefault();
      // Save can only be triggered in EDITING mode
      if (editorState === EDITING) handleClickSave();
    },
    [editorState]
  );

  const handleClickSave = async () => {
    setLoading((loading) => {
      loading.save = true;
    });
    await handleSave();
    setLoading((loading) => {
      loading.save = false;
    });
  };

  const handleClickAdd = async () => {
    setLoading((loading) => {
      loading.add = true;
    });
    await handleAdd();
    setLoading((loading) => {
      loading.add = false;
    });
  };

  const handleClickDelete = async () => {
    setLoading((loading) => {
      loading.delete = true;
    });
    await handleDelete();
    setLoading((loading) => {
      loading.delete = false;
    });
  };

  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        gap: "1em",
      }}
    >
      {editorState === IDLE ? (
        <>
          {loading.add ? (
            <LoadingButton />
          ) : (
            <AddButton onClick={handleClickAdd} />
          )}
          <EditButton />
          {loading.delete ? (
            <LoadingButton />
          ) : (
            <DeleteButton onClick={handleClickDelete} />
          )}
        </>
      ) : (
        <>
          {loading.save ? (
            <LoadingButton />
          ) : (
            <SaveButton onClick={handleClickSave} />
          )}
          <CancelButton onClick={handleCancel} />
        </>
      )}
    </Box>
  );
}
