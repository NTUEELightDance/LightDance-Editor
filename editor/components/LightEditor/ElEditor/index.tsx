import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useReactiveVar } from "@apollo/client";
// styles
import { makeStyles } from "@material-ui/core/styles";

// redux selector and actions
import { selectLoad } from "../../../slices/loadSlice";

// state and actions
import { reactiveState } from "../../../core/state";
import { editCurrentStatus } from "../../../core/actions/currentStatus";

// components
import SlideBar from "../Slidebar";
// constants
import { IDLE } from "constants";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

/**
 * EL parts' slidebar list
 */
export default function ElEditor() {
  // classes
  const classes = useStyles();
  // redux states
  const { dancers } = useSelector(selectLoad);
  // states
  const mode = useReactiveVar(reactiveState.editMode);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);
  const selected = useReactiveVar(reactiveState.selected);

  // selected dancers' elparts
  const [intersectParts, setIntersectParts] = useState([]);
  useEffect(() => {
    if (selected.length) {
      // pick intersection parts
      const elParts = selected.map((dancerName) =>
        // eslint-disable-next-line dot-notation
        Object.keys(dancers[dancerName]["ELPARTS"])
      );
      setIntersectParts(
        elParts.reduce((a, b) => a.filter((c) => b.includes(c)))
      );
    } else setIntersectParts([]);
  }, [selected]);

  // multi chosen elparts
  const [chosenParts, setChosenParts] = useState([]);
  const handleChosenPart = (partName) => {
    if (chosenParts.includes(partName))
      setChosenParts(chosenParts.filter((n) => n !== partName));
    else {
      setChosenParts([...chosenParts, partName]);
    }
  };
  // clear chosen elparts by key "esc"
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
  const handleChangeValue = (partName, value) => {
    selected.forEach((dancerName) => {
      // if chosenParts not empty => change all chosenParts value
      if (chosenParts.length)
        chosenParts.forEach((chosenPartName) => {
          editCurrentStatus({
            payload: { dancerName, partName: chosenPartName, value },
          });
        });
      // only one change
      else editCurrentStatus({ payload: { dancerName, partName, value } });
    });
  };

  return (
    <div className={classes.root}>
      {selected.length
        ? intersectParts.map((partName) => (
            <SlideBar
              key={partName}
              partName={partName}
              disabled={mode === IDLE}
              isChosen={chosenParts.includes(partName)}
              value={currentStatus[selected[0]][partName]}
              handleChosenPart={handleChosenPart}
              handleChangeValue={handleChangeValue}
            />
          ))
        : null}
    </div>
  );
}
