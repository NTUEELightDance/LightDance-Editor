import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

// redux selector and actions
import { selectGlobal, setCurrentStatus } from "../../slices/globalSlice";
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

  // multi selected dancers' elpart
  const [intersectParts, setIntersectParts] = useState([]);
  useEffect(() => {
    if (selected.length) {
      // pick intersection parts
      const elParts = selected.map((dancerName) =>
        Object.keys(dancers[dancerName]["ELPARTS"])
      );
      setIntersectParts(
        elParts.reduce((a, b) => a.filter((c) => b.includes(c)))
      );
    } else setIntersectParts([]);
  }, [selected]);

  const handleChangeStatus = () => {
    // dispatch(setCurrentStatus)
  };
  return (
    <div
      id="slidebars"
      // tabIndex="0"
      // onKeyUp={(e) => {
      //   if (e.keyCode === 27) {
      //     setChosenParts(defaultChosenParts);
      //   }
      // }}
      style={{ outline: "0", border: "0" }}
    >
      {selected.length
        ? intersectParts.map((lightpart) => (
            <SlideBar
              key={lightpart}
              partName={lightpart}
              disabled={mode === IDLE}
              setChosenParts={() => {}}
              setValue={(newValue, isChosen) => {}}
              isChosen={false}
              value={currentStatus[selected[0]][lightpart]}
            />
          ))
        : null}
    </div>
  );
}

// const [currentChoose, setCurrentChoose] = useState(
//   Array(DANCER_NUM).fill(false)
// );
// const defaultChosenParts = LIGHTPARTS.reduce(
//   (acc, key) => ({ ...acc, [key]: false }),
//   {}
// );
// const [chosenParts, setChosenParts] = useState(defaultChosenParts);

// const testPartsValue = Array(DANCER_NUM)
//   .fill(LIGHTPARTS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))
//   .reduce((acc, item, key) => ({ ...acc, [key]: item }), {});

// const [partsValue, setPartsValue] = useState(testPartsValue);

// const [currentDisplayPeople, setCurrentDisplayPeople] = useState(0);

// const handleChangeMultiValues = (newValue) => {
//   currentChoose.forEach((isChosen, peopleNum) => {
//     if (isChosen) {
//       Object.keys(chosenParts)
//         .filter((part) => chosenParts[part])
//         .forEach((part) => {
//           setPartsValue((state) => ({
//             ...state,
//             [peopleNum]: {
//               ...state[peopleNum],
//               [part]: newValue,
//             },
//           }));
//         });
//     }
//   });
// };

// const renderDisplayPeoples = () => {
//   for (let i = currentChoose.length - 1; i > -1; i -= 1) {
//     if (currentChoose[i]) {
//       setCurrentDisplayPeople(i);
//       break;
//     }
//   }
// };

// useEffect(() => {
//   renderDisplayPeoples();
// }, [currentChoose]);
