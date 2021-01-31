import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// import light part constant
import { LIGHTPARTS } from "../../constants/index";

// import components
import SlideBar from "./slidebar";

const Editor = (props) => {
  // ========= State need to be change into Redux ==============

  const [currentTime, setCurrentTime] = useState(0);
  const [currentMode, setCurrentMode] = useState("SAVE");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentPeopleNum, setCurrentPeopleNum] = useState(8);

  const [currentChoose, setCurrentChoose] = useState(
    Array(currentPeopleNum).fill(false)
  );

  // ========= State need to be change into Redux ==============

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

  const renderSlideBars = () => {
    return LIGHTPARTS.map((lightpart) => {
      return (
        <SlideBar
          partName={lightpart}
          disabled={
            currentMode === "EDIT" || currentMode === "ADD" ? false : true
          }
        />
      );
    });
  };

  return (
    <div id="editor" className="col-6">
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
            setCurrentTime(e.target.value ? parseInt(e.target.value, 10) : "");
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
      <div id="slidebars">{renderSlideBars()}</div>
    </div>
  );
};

export default Editor;
