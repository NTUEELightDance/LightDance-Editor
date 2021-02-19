/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import PropTypes from "prop-types";
// import { Slide } from "@material-ui/core";

const SlideBar = ({
  partName,
  disabled,
  isChosen,
  value,
  handleChangeValue,
  handleChosenPart,
}) => {
  const step = 0.1;

  // change value
  const handleSlideChange = (e) => {
    handleChangeValue(partName, Number(e.target.value));
  };
  const handleInputChange = (e) => {
    handleChangeValue(partName, Number(e.target.value));
  };

  // multi choose
  const handleMultiChoose = () => handleChosenPart(partName);

  // scroll to change value
  const preventDefault = (e) => e.preventDefault();
  const mousewheelevt = /Firefox/i.test(navigator.userAgent)
    ? "DOMMouseScroll"
    : "mousewheel";
  const editor = document.getElementById("editor");
  const disableWindowScroll = () => {
    editor.onwheel = preventDefault;
  };
  const enableWindowScroll = () => {
    editor.onwheel = null;
  };
  const moveSlider = (e) => {
    const zoomLevel = Number(e.target.value);
    disableWindowScroll();
    if (e.deltaY < 0) {
      //  scroll down
      e.target.value = zoomLevel - step;
      handleSlideChange(e);
    } else if (e.deltaY > 0) {
      //  scroll up
      e.target.value = zoomLevel + step;
      handleSlideChange(e);
    } else {
      e.target.value = zoomLevel;
    }
  };
  const handleWheel = (e) => {
    e.target.addEventListener(mousewheelevt, moveSlider);
  };

  return (
    <>
      <label
        htmlFor={partName}
        className="form-label"
        onClick={handleMultiChoose}
        style={{
          cursor: "pointer",
          boxShadow: isChosen ? "0 0 0 0.25rem rgb(13 110 253 / 25%)" : "none",
        }}
      >
        {partName}
      </label>
      <div className="input-group">
        <input
          type="range"
          className="form-range form-control me-2"
          style={{ border: "none", backgroundColor: "transparent" }}
          value={value}
          onMouseOver={handleWheel}
          onMouseOut={enableWindowScroll}
          onChange={handleSlideChange}
          disabled={disabled}
          min={0}
          max={1}
          step={step}
        />
        <input
          type="number"
          className="form-control"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          min={0}
          max={1}
          step={step}
        />
      </div>
    </>
  );
};

SlideBar.propTypes = {
  partName: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  isChosen: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired,
  handleChangeValue: PropTypes.func.isRequired,
  handleChosenPart: PropTypes.func.isRequired,
};

export default SlideBar;
