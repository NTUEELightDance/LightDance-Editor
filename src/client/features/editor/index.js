import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// import light part constant
import { LIGHTPARTS } from "../../constants/index";

// import components
import SlideBar from "./slidebar";

const Editor = (props) => {
  // ========= State need to be change into Redux ==============
  const [currentTime, setCurrentTime] = useState(0);
  const [currentMode, setCurrentMode] = useState("");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentPeopleNum, setCurrentPeopleNum] = useState(8);
  // ========= State need to be change into Redux ==============

  const renderRatioButtons = () => {
    let ratioButtonList = [];
    for (let i = 0; i < currentPeopleNum; i++) {
      ratioButtonList.push(
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="inlineRadioOptions"
            id={`people_ratio_${i}`}
            value="option1"
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
      return <SlideBar partName={lightpart} />;
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
        />
        {/* =============== Time  input ================ */}
        {/* ============== Frame Control ============== */}
        <div className="btn-group" role="group">
          <button type="button" className="btn btn-primary me-2">
            {"<"}
          </button>
          <input type="number" className="form-control me-2" />
          <button type="button" className="btn btn-primary">
            {">"}
          </button>
        </div>
        {/* ============== Frame Control ============== */}
      </div>
      {/* =============== People Ratio =============== */}
      <div>{renderRatioButtons()}</div>
      {/* =============== People Ratio =============== */}

      {/* =============== Mode Select =============== */}
      <div className="btn-group" role="group" aria-label="Basic example">
        <button type="button" className="btn btn-primary me-2">
          EDIT
        </button>
        <button type="button" className="btn btn-primary me-2">
          ADD
        </button>
        <button type="button" className="btn btn-primary">
          SAVE
        </button>
      </div>
      {/* =============== Mode Select =============== */}
      <div id="slidebars">{renderSlideBars()}</div>
    </div>
  );
};

export default Editor;
