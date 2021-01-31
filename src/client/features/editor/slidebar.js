import React from "react";

const SliderBar = (props) => {
  const { partName } = props;

  const moveSlider = (e) => {
    // console.log("moveSlider");
    const zoomLevel = parseInt(e.target.value);

    if (e.originalEvent.wheelDelta < 0) {
      //scroll down
      e.target.value = zoomLevel - 10;
    } else {
      //scroll up
      e.target.value = zoomLevel + 10;
    }

    e.target.change();

    //prevent page fom scrolling
    return false;
  };

  const handleWheel = (e) => {
    console.log("onMouseOver");
    const mousewheelevt = /Firefox/i.test(navigator.userAgent)
      ? "DOMMouseScroll"
      : "mousewheel";
    // console.log(e.deltaY);
    e.target.addEventListener(mousewheelevt, moveSlider);
  };

  const handleChange = (e) => {
    //TODO
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
          onMouseOver={handleWheel}
          onChange={handleChange}
        />
        <input type="number" className="form-control" />
      </div>
    </>
  );
};

export default SliderBar;
