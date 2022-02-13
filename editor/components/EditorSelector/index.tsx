// mui
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
// actions and states
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
import { setEditor } from "core/actions";
// contants
import { CONTROL_EDITOR, POS_EDITOR, IDLE } from "constants";

export default function EditorSelector() {
  const editor = useReactiveVar(reactiveState.editor);
  const editMode = useReactiveVar(reactiveState.editMode);

  const handleSwitchEditor = () => {
    // TODO: handle if editMode is in editing or adding mode, should tell user to save first
    if (editMode !== IDLE) {
      alert("Please SAVE or CANCEL first!");
      return;
    }
    setEditor({
      payload: editor === CONTROL_EDITOR ? POS_EDITOR : CONTROL_EDITOR,
    });
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Switch
        onChange={handleSwitchEditor}
        disableRipple={false}
        checked={editor === CONTROL_EDITOR}
      />
      {editor}
    </Stack>
  );
}
