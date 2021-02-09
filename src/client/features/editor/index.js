import React, { useEffect, useState } from "react";
import Scrollbars from "react-custom-scrollbars";

// import components
import SlideBar from "./slidebar";
// import light part constant
import { LIGHTPARTS } from "../../constants/index";

const Editor = (props) => {
  // ========= State need to be change into Redux ==============

  const [currentTime, setCurrentTime] = useState(0);
  const [currentMode, setCurrentMode] = useState("");
  const [currentFrame, setCurrentFrame] = useState(0);

  const [currentPeopleNum, setCurrentPeopleNum] = useState(8);

  const [currentChoose, setCurrentChoose] = useState(
    Array(currentPeopleNum).fill(false)
  );

  const defaultChosenParts = LIGHTPARTS.reduce(
    (acc, key) => ({ ...acc, [key]: false }),
    {}
  );
  const [chosenParts, setChosenParts] = useState(defaultChosenParts);

  const testPartsValue = Array(currentPeopleNum)
    .fill(LIGHTPARTS.reduce((acc, key) => ({ ...acc, [key]: 0 }), {}))
    .reduce((acc, item, key) => ({ ...acc, [key]: item }), {});

  const [partsValue, setPartsValue] = useState(testPartsValue);

  const [currentDisplayPeople, setCurrentDisplayPeople] = useState(0);

  // ========= State need to be change into Redux ==============
  // ========= scroll bar config ============
  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: "rgba(192,192,200, 0.5)",
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };
  // ========= scroll bar config ============

  // ========= self state =================

  // ========= self state =================

  const renderCheckBoxes = () => {
    let ratioButtonList = [];
    for (let i = 0; i < currentPeopleNum; i++) {
      ratioButtonList.push(
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="checkbox"
            id={`people_chekbox_${i}`}
            value="option1"
            onChange={() => {
              setCurrentChoose((state) =>
                state.map((choose, j) => {
                  return i === j ? !choose : choose;
                })
              );
            }}
            checked={currentChoose[i]}
          />
          <label className="form-check-label" for={`people_ratio_${i}`}>
            {i}
          </label>
        </div>
      );
    }

    return ratioButtonList;
  };

  const handleChangeMultiValues = (newValue) => {
    currentChoose.forEach((isChosen, peopleNum) => {
      if (isChosen) {
        Object.keys(chosenParts)
          .filter((part) => chosenParts[part])
          .forEach((part) => {
            setPartsValue((state) => ({
              ...state,
              [peopleNum]: {
                ...state[peopleNum],
                [part]: newValue,
              },
            }));
          });
      }
    });
  };

  const renderSlideBars = () => {
    return LIGHTPARTS.map((lightpart) => {
      return (
        <SlideBar
          partName={lightpart}
          disabled={
            currentMode === "EDIT" || currentMode === "ADD" ? false : true
          }
          setChosenParts={setChosenParts}
          setValue={(newValue, isChosen) => {
            if (isChosen) {
              handleChangeMultiValues(newValue);
            } else {
              currentChoose.forEach((isPeopleChosen, peopleNum) => {
                if (isPeopleChosen) {
                  setPartsValue((state) => ({
                    ...state,
                    [peopleNum]: {
                      ...state[peopleNum],
                      [lightpart]: newValue,
                    },
                  }));
                }
              });
            }
          }}
          isChosen={chosenParts[lightpart]}
          value={partsValue[currentDisplayPeople][lightpart]}
        />
      );
    });
  };

  const renderDisplayPeoples = () => {
    for (let i = currentChoose.length - 1; i > -1; i -= 1) {
      if (currentChoose[i]) {
        setCurrentDisplayPeople(i);
        break;
      }
    }
  };

  useEffect(() => {
    renderDisplayPeoples();
  }, [currentChoose]);

  useEffect(() => {
    // TODO
    // get new frame and update other state
  }, [currentFrame]);

  return (
    <div
      id="editor"
      className="col-4 d-inline-block container"
      style={{ height: "720px" }} // ugly for now
    >
      <Scrollbars renderThumbVertical={renderThumb}>
        {/* =============== Time  input ================ */}
        <div className="input-group mb-3 mr-2">
          <span className="input-group-text" id="basic-addon1">
            Time:
          </span>
          <input
            type="text"
            className="form-control"
            aria-describedby="basic-addon1"
            value={currentTime}
            onChange={(e) => {
              setCurrentTime(
                e.target.value ? parseInt(e.target.value, 10) : ""
              );
            }}
          />
          {/* =============== Time  input ================ */}
          {/* ============== Frame Control ============== */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className="btn btn-primary me-2"
              disabled={currentFrame === 0}
              onClick={(e) => {
                e.preventDefault();
                setCurrentFrame((state) => state - 1);
              }}
            >
              {"<"}
            </button>
            <input
              type="number"
              className="form-control me-2"
              placeholder="Frame"
              onChange={(e) => {
                setCurrentFrame(
                  e.target.value ? parseInt(e.target.value, 10) : ""
                );
              }}
              value={currentFrame}
              min="0"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                e.preventDefault();
                setCurrentFrame((state) => state + 1);
              }}
            >
              {">"}
            </button>
          </div>
          {/* ============== Frame Control ============== */}
        </div>
        {/* =============== People Ratio =============== */}
        <div className="input-group" role="group">
          {renderCheckBoxes()}
          <button
            className="btn btn-primary"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setCurrentChoose(Array(currentPeopleNum).fill(true));
            }}
          >
            Choose All
          </button>

          <button
            className="btn btn-primary"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setCurrentChoose(Array(currentPeopleNum).fill(false));
            }}
          >
            Cancel All
          </button>
        </div>
        {/* =============== People Ratio =============== */}

        {/* =============== Mode Select =============== */}
        {/* TODO */}
        {/* need to implement appearance */}
        <div className="btn-group" role="group" aria-label="Basic example">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={(e) => {
              e.preventDefault();
              setCurrentMode(currentMode === "EDIT" ? "" : "EDIT");
            }}
          >
            EDIT
          </button>
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={(e) => {
              e.preventDefault();
              setCurrentMode(currentMode === "ADD" ? "" : "ADD");
            }}
          >
            ADD
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault();
              setCurrentMode("");
              // TODO
              // save to db
            }}
          >
            SAVE
          </button>
          {/* ============= Current Display Value =========== */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className="btn btn-primary me-2"
              disabled={currentDisplayPeople === 0}
              onClick={(e) => {
                e.preventDefault();
                setCurrentDisplayPeople((state) => state - 1);
              }}
            >
              {"<"}
            </button>
            <input
              type="number"
              className="form-control me-2"
              placeholder="Display"
              onChange={(e) => {
                if (e.target.value !== "") {
                  setCurrentDisplayPeople(parseInt(e.target.value, 10));
                }
              }}
              value={currentDisplayPeople}
              min="0"
              max={`${currentPeopleNum - 1}`}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={currentDisplayPeople === currentPeopleNum - 1}
            onClick={(e) => {
              e.preventDefault();
              setCurrentDisplayPeople((state) => state + 1);
            }}
          >
            {">"}
          </button>
          {/* ============= Current Display Value =========== */}
        </div>
        {/* =============== Mode Select =============== */}
        {/* =============== SlideBars ================= */}

        <div
          id="slidebars"
          tabIndex="0"
          onKeyUp={(e) => {
            if (e.keyCode === 27) {
              setChosenParts(defaultChosenParts);
            }
          }}
          style={{ outline: "0", border: "0" }}
        >
          {renderSlideBars()}
        </div>
        {/* =============== Del Button ================ */}
        <button
          type="button"
          className="btn btn-primary"
          disabled={currentMode !== "EDIT" && currentMode !== "ADD"}
          onClick={(e) => {
            e.preventDefault();
            // TODO
            // delete current frame
          }}
        >
          DEL
        </button>
        {/* =============== Del Button ================ */}
      </Scrollbars>
      {/* =============== SlideBars ================= */}
    </div>
  );
};

export default Editor;
