import { useEffect, useState } from "react";
// mui
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import AutoAwesomeMotionRoundedIcon from "@mui/icons-material/AutoAwesomeMotionRounded";
import EditLocationSharpIcon from "@mui/icons-material/EditLocationSharp";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
// actions and states
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
import { initStatusStack, initPosStack } from "core/actions";
import { setSelectionModeByEditor, setEditor } from "core/actions";
// contents
import { CONTROL_EDITOR, POS_EDITOR, LED_EDITOR, IDLE } from "@/constants";

import { notification } from "core/utils";

import type { Editor } from "core/models";

export default function EditorSelector() {
  const editor = useReactiveVar(reactiveState.editor);
  const editMode = useReactiveVar(reactiveState.editMode);
  const [EditorMode, setEditorMode] = useState<Editor>("CONTROL_EDITOR");

  const handleChangeEditor = (
    event: React.MouseEvent<HTMLElement>,
    newEditorMode: Editor
  ) => {
    // TODO: handle if editMode is in editing or adding mode, should tell user to save first
    if (editMode !== IDLE) {
      notification.warning("Please SAVE or CANCEL first!");
      return;
    }
    if (newEditorMode !== null) {
      if (newEditorMode !== LED_EDITOR) {
        setSelectionModeByEditor({ payload: editor });
      }
      setEditorMode(newEditorMode);
      setEditor({ payload: newEditorMode });
    }
  };

  // useHotkeys(
  //   "v",
  //   () => {
  //     console.log(`editor: ${editor}`);
  //     console.log(`EditorMode: ${EditorMode}`);
  //     setSelectionModeByEditor({ payload: editor });
  //     setEditorMode("POS_EDITOR");
  //     setEditor({ payload: EditorMode });
  //     console.log(`editor: ${editor}`);
  //     console.log(`EditorMode: ${EditorMode}`);
  //   },
  //   [editor, editMode]
  // );

  useEffect(() => {
    // renew statusStack and posStack
    initStatusStack();
    initPosStack();
  }, [editor, editMode]);

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <ToggleButtonGroup
        color="primary"
        size="medium"
        exclusive
        onChange={handleChangeEditor}
        disabled={editMode !== IDLE}
        value={EditorMode}
      >
        <ToggleButton value={CONTROL_EDITOR}>
          <Tooltip
            title={<Typography fontSize={16}>Control Editor</Typography>}
          >
            <AutoAwesomeMotionRoundedIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value={POS_EDITOR}>
          <Tooltip
            title={<Typography fontSize={16}>Position Editor</Typography>}
          >
            <EditLocationSharpIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value={LED_EDITOR}>
          <Tooltip title={<Typography fontSize={16}>LED Editor</Typography>}>
            <ViewCompactIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
