import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// mui
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
// redux selector and actions
import {
  selectGlobal,
  editCurrentStatusLED,
} from "../../../slices/globalSlice";
import { selectLoad } from "../../../slices/loadSlice";

// components
import SlideBar from "../slidebar";
// constants
import { IDLE } from "../../../constants";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

/**
 * Led parts' slidebar list and selector
 */
export default function LedEditor() {
  // classes
  const classes = useStyles();
  // redux states
  const dispatch = useDispatch();
  const { dancers, texture } = useSelector(selectLoad);
  const { mode, currentStatus, selected } = useSelector(selectGlobal);

  // selected dancers' ledparts
  const [intersectParts, setIntersectParts] = useState([]);
  useEffect(() => {
    if (selected.length) {
      // pick intersection parts
      const elParts = selected.map((dancerName) =>
        // eslint-disable-next-line dot-notation
        Object.keys(dancers[dancerName]["LEDPARTS"])
      );
      setIntersectParts(
        elParts.reduce((a, b) => a.filter((c) => b.includes(c)))
      );
    } else setIntersectParts([]);
  }, [selected]);

  // multi chosen ledparts
  const [chosenParts, setChosenParts] = useState([]);
  const handleChosenPart = (partName) => {
    if (chosenParts.includes(partName))
      setChosenParts(chosenParts.filter((n) => n !== partName));
    else {
      setChosenParts([...chosenParts, partName]);
    }
  };
  // clear chosen ledparts by key "esc"
  const handleClearChosenPart = (e) => {
    if (e.key === "Escape") setChosenParts([]);
  };
  useEffect(() => {
    window.addEventListener("keydown", handleClearChosenPart);
    return () => {
      window.removeEventListener("keydown", handleClearChosenPart);
    };
  }, []);

  // changeStatus
  // led value: { src, alpha }
  const handleChangeAlpha = (partName, alpha) => {
    // TODO
    selected.forEach((dancerName) => {
      // if chosenParts not empty => change all chosenParts value
      if (chosenParts.length)
        chosenParts.forEach((chosenPartName) => {
          dispatch(
            editCurrentStatusLED({
              dancerName,
              partName: chosenPartName,
              value: { alpha },
            })
          );
        });
      // only one change
      else
        dispatch(
          editCurrentStatusLED({ dancerName, partName, value: { alpha } })
        );
    });
  };
  const handleChangeSrc = (partName, src) => {
    selected.forEach((dancerName) => {
      dispatch(editCurrentStatusLED({ dancerName, partName, value: { src } }));
    });
  };

  // TODO: change texture
  return (
    <div className={classes.root}>
      {selected.length
        ? intersectParts.map((partName) => (
            <div style={{ marginBottom: 16 }}>
              <SlideBar
                key={partName}
                partName={partName}
                disabled={mode === IDLE}
                isChosen={chosenParts.includes(partName)}
                value={currentStatus[selected[0]][partName].alpha}
                handleChosenPart={handleChosenPart}
                handleChangeValue={handleChangeAlpha}
              />
              <FormControl>
                <Select
                  disabled={mode === IDLE}
                  value={currentStatus[selected[0]][partName].src}
                  onChange={(e) => handleChangeSrc(partName, e.target.value)}
                >
                  {texture[partName].name.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          ))
        : null}
    </div>
  );
}
