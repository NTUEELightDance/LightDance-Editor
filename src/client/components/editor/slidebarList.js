import React from "react";
import { useSelector, useDispatch } from "react-redux";

// redux selector and actions
import { selectGlobal, setCurrentStatus } from "../../slices/globalSlice";

// components
import SlideBar from "./slidebar";
// constants
import { LIGHTPARTS, LEDPARTS, IDLE } from "../../constants";

export default function SlidebarList() {
  // redux states
  const { mode, currentStatus, selected } = useSelector(selectGlobal);
  const dispatch = useDispatch();

  //
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
      {selected.length > 0
        ? LIGHTPARTS.map((lightpart) => (
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
