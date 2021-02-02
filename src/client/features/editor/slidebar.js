import React, { useState, useEffect } from "react";

const SliderBar = (props) => {
  // ======= const value props ============
  const { partName, disabled, isChosen, value } = props;

  // ======= const function props =========
  const { setChosenParts, setValue } = props;

  // const [value, setValue] = useState(0);
  // const [isChosen, setIsChosen] = useState(false); //wrong!

  const step = 0.01;

  const preventDefault = (e) => e.preventDefault();

  const mousewheelevt = /Firefox/i.test(navigator.userAgent)
    ? "DOMMouseScroll"
    : "mousewheel";

  const editor = document.getElementById("editor");

  const disableWindowScroll = () => {
    editor.onwheel = preventDefault;
  };

  const enableWindowScroll = (e) => {
    editor.onwheel = null;
  };

  const moveSlider = (e) => {
    const zoomLevel = Number(e.target.value);

    // console.log(e.deltaY);

    // ========================= disable window scrolling ==================
    disableWindowScroll();
    // ========================= disable window scrolling ==================

    if (e.deltaY < 0) {
      //  scroll down
      e.target.value = zoomLevel - step;
    } else if (e.deltaY > 0) {
      //  scroll up
      e.target.value = zoomLevel + step;
    } else {
      e.target.value = zoomLevel;
    }

    setValue(Number(e.target.value), isChosen);
  };

  const handleWheel = (e) => {
    e.target.addEventListener(mousewheelevt, moveSlider);
  };

  const handleChange = (e) => {
    setValue(Number(e.target.value), isChosen);
  };

  const handleInputChange = (e) => {
    setValue(e.target.value ? Number(e.target.value) : 0, isChosen);
  };

  const setIsChosen = () => {
    setChosenParts((state) => ({ ...state, [partName]: true }));
  };

  const handleMultiChoose = (e) => {
    e.preventDefault();
    setIsChosen();
  };

  return (
    <>
      <label for={partName} className="form-label">
        {partName}
      </label>
      <div
        className="input-group"
        onDoubleClick={handleMultiChoose}
        style={{
          boxShadow: isChosen ? "0 0 0 0.25rem rgb(13 110 253 / 25%)" : "none",
        }}
      >
        <input
          type="range"
          className="form-range form-control me-2"
          style={{ border: "none", backgroundColor: "transparent" }}
          id={partName}
          value={value}
          onMouseOver={handleWheel}
          onMouseOut={enableWindowScroll}
          onChange={handleChange}
          disabled={disabled}
          min={0}
          max={1}
          step={0.01}
        />
        <input
          type="number"
          className="form-control"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          min={0}
          max={1}
          step={0.01}
        />
      </div>
    </>
  );
};

export default SliderBar;
