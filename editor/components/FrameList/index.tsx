import Scrollbars from "react-custom-scrollbars";
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

  // scroll bar config
  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: "rgba(192,192,200, 0.5)",
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  if (loading) return "loading...";
  return (
    <div className={classes.root}>
      <div className={classes.grow}>
        <Scrollbars renderThumbVertical={renderThumb}>
          <List component="nav">
            {record.map((id: string, idx: number) => (
              <FrameItem
                key={id}
                idx={idx}
                start={map[record[idx]].start}
                selected={currentIndex === idx}
                handleSelectItem={handleSelectItem}
              />
            ))}
          </List>
        </Scrollbars>
      </div>
    </div>
  );
}
