import { useEffect, useState } from "react";
// mui
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import OpenWithRoundedIcon from "@mui/icons-material/OpenWithRounded";
import BlurOnIcon from "@mui/icons-material/BlurOn";
// actions and states
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
import { initStatusStack, initPosStack } from "core/actions";
import { setSelectionModeByEditor, setEditor } from "core/actions";
// contents
import { CONTROL_EDITOR, POS_EDITOR, LED_EDITOR, IDLE } from "@/constants";
import LEDEffectDialog from "@/components/LEDEffectList/LEDEffectDialog";
import { notification } from "@/core/utils";

import type { Editor } from "@/core/models";

export default function EditorSelector() {
  const editor = useReactiveVar(reactiveState.editor);
  const editorState = useReactiveVar(reactiveState.editorState);
  const [EditorMode, setEditorMode] = useState<Editor>("CONTROL_EDITOR");
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const openDialog = () => {
    setAddDialogOpen(true);
  };
  const handleChangeEditor = (
    event: React.MouseEvent<HTMLElement>,
    newEditorMode: Editor
  ) => {
    // TODO: handle if editMode is in editing or adding mode, should tell user to save first
    if (editorState !== IDLE) {
      notification.warning("Please SAVE or CANCEL first!");
      return;
    }
    if (newEditorMode !== null) {
      if (newEditorMode !== LED_EDITOR) {
        setSelectionModeByEditor({ payload: editor });
        setEditor({ payload: newEditorMode });
      }
      setEditorMode(newEditorMode);
    }
  };

  useEffect(() => {
    // renew statusStack and posStack
    initStatusStack();
    initPosStack();
  }, [editor, editorState]);

  return (
    <div>
      <ToggleButtonGroup
        color="primary"
        size="medium"
        exclusive
        onChange={handleChangeEditor}
        disabled={editorState !== IDLE}
        value={EditorMode}
      >
        <ToggleButton value={CONTROL_EDITOR}>
          <Tooltip
            enterNextDelay={100}
            title={<Typography fontSize={16}>Control Editor</Typography>}
          >
            <LightbulbIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value={POS_EDITOR}>
          <Tooltip
            enterNextDelay={100}
            title={<Typography fontSize={16}>Position Editor</Typography>}
          >
            <OpenWithRoundedIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton onClick={openDialog} value={LED_EDITOR}>
          <Tooltip
            enterNextDelay={100}
            title={<Typography fontSize={16}>LED Editor</Typography>}
          >
            <BlurOnIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
      <LEDEffectDialog
        addDialogOpen={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
      />
    </div>
  );
}
