import React from "react";
// mui
import { makeStyles } from "@material-ui/styles";
import Typography from "@material-ui/core/Typography";
// components
import TimeController from "./timeController";
import File from "./file";

const useStyles = makeStyles({
  flex: {
    display: "flex",
    alignItems: "center",
  },
  title: {
    marginRight: 10,
  },
});

/**
 * Top Bar, include title, timeController, upload/download btn
 */
export default function Bar() {
  const classes = useStyles();
  return (
    <div className={classes.flex}>
      <Typography className={classes.title} variant="h5" color="initial">
        {" "}
        2021 NTUEE LightDance
      </Typography>
      <TimeController />
      <File />
    </div>
  );
}
