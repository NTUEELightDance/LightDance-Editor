import React from "react";
import { useDispatch } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
// mui
import { makeStyles } from "@material-ui/core/styles";

// redux selector and actions
import {
  saveCurrentStatus,
  deleteCurrentStatus,
} from "../../slices/globalSlice";
// components
import SelectDancer from "./selectDancer";
import SlidebarList from "./slidebarList";
import ModeSelector from "../modeSelector";
// constants

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1),
  },
  selectDancer: {
    position: "fixed",
  },
  grow: {
    flexGrow: 1,
  },
}));

export default function LightEditor() {
  // styles
  const classes = useStyles();

  const dispatch = useDispatch();

  // save
  const handleSave = () => {
    dispatch(saveCurrentStatus());
  };
  // delete
  const handleDelete = () => {
    if (window.confirm(`Are you sure to delete ?`))
      dispatch(deleteCurrentStatus());
  };

  // scroll bar config
  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: "rgba(192,192,200, 0.5)",
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  return (
    <div id="editor" className={classes.root}>
      <ModeSelector handleSave={handleSave} handleDelete={handleDelete} />
      <SelectDancer className={classes.selectDancer} />
      <div className={classes.grow}>
        <Scrollbars renderThumbVertical={renderThumb}>
          <SlidebarList />
        </Scrollbars>
      </div>
      {/* TODO: led slider, selection  */}
    </div>
  );
}
