import { useImmer } from "use-immer";
// mui
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
// actions and states
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
import { addFrameToCurrentLEDEffect } from "core/actions";
// constants
import { IDLE, EDITING, LED_EDITOR } from "@/constants";
// hooks
import useEditHandler from "hooks/useEditHandler";
import { useHotkeys } from "react-hotkeys-hook";
import { ledAgent } from "@/api";
export default function EditButtons() {
  const editorState = useReactiveVar(reactiveState.editorState);
  const editor = useReactiveVar(reactiveState.editor);

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

  function handleClickAddTest() {
    ledAgent.addLEDEffect({
      editing: null,
      frames: null,
      name: "LED1",
      partName: "tie_LED",
      repeat: 0,
    });
  }

  function handleClickSaveTest() {
    ledAgent.saveLEDEffect({
      frames: {
        set: [],
      },
      name: "LED1",
      id: 25,
      repeat: 0,
    });
  }
  function handleClickDeleteTest() {
    ledAgent.deleteLEDEffect("LED1", "tie_LED");
  }

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

  function LEDEditButton() {
    return (
      <Button
        variant="outlined"
        size="small"
        color="primary"
        //onClick
        onClick={handleClickSaveTest}
      >
        EDIT
      </Button>
    );
  }

  function LEDDeleteButton() {
    return (
      <Button
        variant="outlined"
        size="small"
        color="error"
        onClick={handleClickDeleteTest}
        //onClick
      >
        DEL
      </Button>
    );
  }

  function LEDAddButton() {
    return (
      <Button
        variant="outlined"
        size="small"
        color="primary"
        onClick={handleClickAddTest}
        //onClick
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
        gap: "1em",
      }}
    >
      {editorState === IDLE ? (
        editor === LED_EDITOR ? (
          <>
            {loading.add ? <LoadingBtn /> : <LEDAddButton />}
            <LEDEditButton />
            {loading.delete ? <LoadingBtn /> : <LEDDeleteButton />}
          </>
        ) : (
          <>
            {loading.add ? <LoadingBtn /> : <AddButton />}
            <EditButton />
            {loading.delete ? <LoadingBtn /> : <DeleteButton />}
          </>
        )
      ) : (
        <>
          {loading.save ? <LoadingBtn /> : <SaveButton />}
          <CancelButton />
        </>
      )}
    </Box>
  );
}
