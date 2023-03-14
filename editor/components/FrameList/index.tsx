// mui
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
// components
import FrameItem from "./FrameItem";
// states and actions
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
// hooks
import useControlFrameList from "./useControlFrameList";
import usePosFrameList from "./usePosFrameList";
import Loading from "../Loading";
import useLEDEditorFrameList from "./useLEDEditorFrameList";

export default function FrameList() {
  const editor = useReactiveVar(reactiveState.editor);
  // get data and handler from different mode
  const controlFrameList = useControlFrameList();
  const posFrameList = usePosFrameList();
  const LEDFrameList = useLEDEditorFrameList();
  const { loading, frames, currentIndex, handleSelectItem } =
    editor === "CONTROL_EDITOR"
      ? controlFrameList
      : editor === "POS_EDITOR"
      ? posFrameList
      : LEDFrameList;

  if (loading) return <Loading />;

  return (
    <Paper sx={{ minHeight: "100%" }} square>
      <List component="nav" disablePadding>
        {frames.map(({ start, id }, index) => (
          <FrameItem
            key={id}
            idx={index}
            start={start}
            selected={index === currentIndex}
            handleSelectItem={handleSelectItem}
          />
        ))}
      </List>
    </Paper>
  );
}
