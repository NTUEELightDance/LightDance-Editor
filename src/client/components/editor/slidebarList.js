import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// redux selector and actions
import { selectGlobal, editCurrentStatus } from "../../slices/globalSlice";
import { selectLoad } from "../../slices/loadSlice";

// components
import SlideBar from "./slidebar";
// constants
import { IDLE } from "../../constants";

/**
 * EL parts' slidebar list
 */
export default function SlidebarList() {
  // redux states
  const dispatch = useDispatch();
  const { dancers } = useSelector(selectLoad);
  const { mode, currentStatus, selected } = useSelector(selectGlobal);

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
          dispatch(
            editCurrentStatus({ dancerName, partName: chosenPartName, value })
          );
        });
      // only one change
      else dispatch(editCurrentStatus({ dancerName, partName, value }));
    });
  };

  return (
    <div>
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
