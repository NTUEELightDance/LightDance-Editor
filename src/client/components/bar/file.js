import React from "react";
// mui
import { makeStyles } from "@material-ui/styles";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles({
  flex: {
    display: "flex",
    alignItems: "center",
  },
});

/**
 * Comonent for upload and download files (controlRecord and posRecord)
 */
export default function File() {
  const classes = useStyles();
  // TODO
  return (
    <div className={classes.flex}>
      <Button variant="outlined" size="small">
        Download
      </Button>
      <Button variant="outlined" size="small">
        Uplaod
      </Button>
    </div>
  );
}
