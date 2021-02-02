import React, { useState } from "react";

// import components
import SlideBar from "./slidebar";
import Scrollbars from "react-custom-scrollbars";
// import light part constant
import { LIGHTPARTS } from "../../constants/index";

const Editor = (props) => {
  // ========= State need to be change into Redux ==============

  const [currentTime, setCurrentTime] = useState(0);
  const [currentMode, setCurrentMode] = useState("SAVE");
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

  const testPartsValue = LIGHTPARTS.reduce(
    (acc, key) => ({ ...acc, [key]: 0 }),
    {}
  );

  const [partsValue, setPartsValue] = useState(testPartsValue);

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

  const [multiChosenValue, setMultiChosenValue] = useState(0);

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
    Object.keys(chosenParts)
      .filter((part) => chosenParts[part])
      .forEach((part) => {
        setPartsValue((state) => ({ ...state, [part]: newValue }));
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
              setPartsValue((state) => ({ ...state, [lightpart]: newValue }));
            }
          }}
          isChosen={chosenParts[lightpart]}
          value={partsValue[lightpart]}
        />
      );
    });
  };

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
              disabled={currentFrame === 0 ? true : false}
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
        <div className="btn-group" role="group" aria-label="Basic example">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={(e) => {
              e.preventDefault();
              setCurrentMode("EDIT");
            }}
          >
            EDIT
          </button>
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={(e) => {
              e.preventDefault();
              setCurrentMode("ADD");
            }}
          >
            ADD
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => {
              e.preventDefault();
              setCurrentMode("SAVE");
            }}
          >
            SAVE
          </button>
        </div>
        {/* =============== Mode Select =============== */}

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
      </Scrollbars>
    </div>
  );
};

export default Editor;
