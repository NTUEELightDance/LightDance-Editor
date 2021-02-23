import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
// mui
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
// redux selector and actions
import { setCurrentFade, selectGlobal } from "../../slices/globalSlice";
// constants
import { IDLE } from "../../constants";

/**
 * Fade button
 * @component
 */
export default function Fade() {
  const dispatch = useDispatch();
  const { mode, currentFade } = useSelector(selectGlobal);

  // handle action
  const handleSwitchFade = () => {
    dispatch(setCurrentFade(!currentFade));
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={currentFade}
          disabled={mode === IDLE}
          onChange={handleSwitchFade}
          name="switchFade"
          color="primary"
        />
      }
      label="fade"
    />
  );
}
