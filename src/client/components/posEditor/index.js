import React from "react";
import { useDispatch } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
// mui
import { makeStyles } from "@material-ui/core/styles";

// redux selector and actions
import { saveCurrentPos, deleteCurrentPos } from "../../slices/globalSlice";
// components
import ModeSelector from "../modeSelector";
import PosList from "./posList";
// constants

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

export default function PosEditor() {
  // styles
  const classes = useStyles();

  const dispatch = useDispatch();
  // save
  const handleSave = () => {
    dispatch(saveCurrentPos());
  };
  // delete
  const handleDelete = () => {
    if (window.confirm(`Are you sure to delete ?`)) {
      dispatch(deleteCurrentPos());
    }
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
    <div className={classes.root}>
      <ModeSelector handleSave={handleSave} handleDelete={handleDelete} />
      <div className={classes.grow}>
        <Scrollbars renderThumbVertical={renderThumb}>
          <PosList />
        </Scrollbars>
      </div>
      {/* TODO: led slider, selection  */}
    </div>
  );
}
