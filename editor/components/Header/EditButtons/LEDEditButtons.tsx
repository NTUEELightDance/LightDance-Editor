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

import { addFrameToCurrentLEDEffect } from "@/core/actions/led";

function LEDEditButton() {
  const editorState = useReactiveVar(reactiveState.editorState);

  const loading = {
    save: false,
    add: false,
    delete: false,
  };

  const handleAddFrame = async () => {
    loading.add = true;
    await addFrameToCurrentLEDEffect();
    loading.add = false;
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
          <EditButton />
          {loading.delete ? <LoadingButton /> : <DeleteButton />}
        </>
      ) : (
        <>
          {loading.save ? <LoadingButton /> : <SaveButton />}
          <CancelButton />
        </>
      )}
    </Box>
  );
}

export default LEDEditButton;
