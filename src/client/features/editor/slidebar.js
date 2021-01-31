import React, { useState } from "react";

const SliderBar = (props) => {
  const { partName, disabled } = props;

  const [value, setValue] = useState(0);

  const step = 1;

  const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };
  const preventDefault = (e) => e.preventDefault();
  const preventDefaultForScrollKeys = (e) => {
    if (keys[e.keyCode]) {
      preventDefault(e);
      return false;
    }
  };
  const mousewheelevt = /Firefox/i.test(navigator.userAgent)
    ? "DOMMouseScroll"
    : "mousewheel";

  // modern Chrome requires { passive: false } when adding event
  const supportsPassive = true;

  const disableWindowScroll = () => {
    const wheelOpt = supportsPassive ? { passive: false } : false;
    window.addEventListener(mousewheelevt, preventDefault, wheelOpt); // modern desktop
    /* window.addEventListener("touchmove", preventDefault, wheelOpt); // mobile
    window.addEventListener("keydown", preventDefaultForScrollKeys, false); */
  };

  const enableWindowScroll = (e) => {
    const wheelOpt = supportsPassive ? { passive: false } : false;
    console.log("enableWindowScroll");
    window.removeEventListener(mousewheelevt, preventDefault, wheelOpt);
    /* window.removeEventListener("touchmove", preventDefault, wheelOpt);
    window.removeEventListener("keydown", preventDefaultForScrollKeys, false); */
  };

  const moveSlider = (e) => {
    // console.log("moveSlider");
    const zoomLevel = parseInt(e.target.value, 10);

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

    setValue(e.target.value);
  };

  const handleWheel = (e) => {
    e.target.addEventListener(mousewheelevt, moveSlider);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <>
      <label for={partName} className="form-label">
        {partName}
      </label>
      <div className="input-group">
        <input
          type="range"
          className="form-range form-control me-2"
          style={{ border: "none" }}
          id={partName}
          value={value}
          onMouseOver={handleWheel}
          onMouseOut={enableWindowScroll}
          onChange={handleChange}
          disabled={disabled}
        />
        <input
          type="number"
          className="form-control"
          value={value / 100}
          onChange={handleInputChange}
          disabled={disabled}
          min="0"
        />
      </div>
    </>
  );
};

export default SliderBar;
