import React from "react";
// mui
import { makeStyles } from "@material-ui/core/styles";
import List from "@mui/material/List";
// components
import FrameItem from "./FrameItem";
// states and actions
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "core/state";
// constants
import { CONTROL_EDITOR } from "constants";
// hooks
import useControlFrameList from "./useControlFrameList";
import usePosFrameList from "./usePosFrameList";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1),
  },

  grow: {
    flexGrow: 1,
  },
}));

export default function FrameList() {
  const editor = useReactiveVar(reactiveState.editor);
  // get data and handler from different mode
  const controlFrameList = useControlFrameList();
  const posFrameList = usePosFrameList();
  const { loading, map, record, currentIndex, handleSelectItem } =
    editor === CONTROL_EDITOR ? controlFrameList : posFrameList;

  // styles
  const classes = useStyles();

  if (loading) return "loading...";
  return (
    <div className={classes.root}>
      <div className={classes.grow}>
        <List component="nav">
          {record.map((id: string, idx: number) => (
            <React.Fragment key={id}>
              {map[record[idx]] && (
                <FrameItem
                  idx={idx}
                  start={map[record[idx]].start}
                  selected={currentIndex === idx}
                  handleSelectItem={handleSelectItem}
                />
              )}
            </React.Fragment>
          ))}
        </List>
      </div>
    </div>
  );
}
