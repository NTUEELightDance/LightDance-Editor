// mui
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
// components
import FrameItem from "./FrameItem";
// states and actions
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
// constants
import { CONTROL_EDITOR } from "@/constants";
// hooks
import useControlFrameList from "./useControlFrameList";
import usePosFrameList from "./usePosFrameList";

export default function FrameList() {
  const editor = useReactiveVar(reactiveState.editor);
  // get data and handler from different mode
  const controlFrameList = useControlFrameList();
  const posFrameList = usePosFrameList();
  const { loading, map, record, currentIndex, handleSelectItem } =
    editor === CONTROL_EDITOR ? controlFrameList : posFrameList;

  if (loading) return <>loading...</>;

  return (
    <Paper sx={{ minHeight: "100%" }} square>
      <List component="nav" disablePadding>
        {record.map(
          (id: string, idx: number) =>
            map[record[idx]] && (
              <FrameItem
                key={id}
                idx={idx}
                start={map[record[idx]].start}
                selected={currentIndex === idx}
                handleSelectItem={handleSelectItem}
              />
            )
        )}
      </List>
    </Paper>
  );
}
