/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from "react";
import PropTypes from "prop-types";
// mui
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";

const useStyles = makeStyles((theme) => ({
  slider: {
    marginRight: theme.spacing(2),
  },
  input: {
    width: 100,
  },
}));

/**
 * SlideBar (EL), can click label to choose, press esc can cancel chosen parts
 * @param {string} partName - EL partName of the slideBar
 * @param {boolean} disabled - EL part is disabled or not (depends on mode)
 * @param {boolean} isChosen - EL part is chosen or not
 * @param {number} value - EL part current value
 * @param {function} handleChangeValue - change el part value
 * @param {function} handleChosenPart - change chosen el part
 */
export default function SlideBar({
  partName,
  disabled,
  isChosen,
  value,
  handleChangeValue,
  handleChosenPart,
}) {
  const step = 0.1;
  // styles
  const classes = useStyles();

  // change value
  const handleSlideChange = (e, val) => {
    handleChangeValue(partName, val);
  };
  const handleInputChange = (e, val) => {
    handleChangeValue(partName, val);
  };

  // multi choose
  const handleMultiChoose = () => handleChosenPart(partName);

  // scroll to change value
  // const preventDefault = (e) => e.preventDefault();
  // const mousewheelevt = /Firefox/i.test(navigator.userAgent)
  //   ? "DOMMouseScroll"
  //   : "mousewheel";
  // const editor = document.getElementById("editor");
  // const disableWindowScroll = () => {
  //   editor.onwheel = preventDefault;
  // };
  // const enableWindowScroll = () => {
  //   editor.onwheel = null;
  // };
  // const moveSlider = (e) => {
  //   const zoomLevel = Number(e.target.value);
  //   if (e.deltaY < 0) {
  //     //  scroll down
  //     e.target.value = zoomLevel - step;
  //     handleSlideChange(e);
  //   } else if (e.deltaY > 0) {
  //     //  scroll up
  //     e.target.value = zoomLevel + step;
  //     handleSlideChange(e);
  //   } else {
  //     e.target.value = zoomLevel;
  //   }
  // };
  // const enableWheel = (e) => {
  //   disableWindowScroll();
  //   e.target.addEventListener(mousewheelevt, moveSlider);
  // };
  // const disableWheel = (e) => {
  //   enableWindowScroll();
  //   e.target.removeEventListener(mousewheelevt, moveSlider);
  // };

  return (
    <>
      <Typography
        onClick={handleMultiChoose}
        variant="body1"
        style={{
          cursor: "pointer",
          boxShadow: isChosen ? "0 0 0 0.25rem rgb(13 110 253 / 25%)" : "none",
        }}
      >
        {partName}
      </Typography>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Slider
          className={classes.slider}
          value={value}
          // onMouseOver={enableWheel}
          // onMouseOut={disableWheel}
          onChange={handleSlideChange}
          disabled={disabled}
          min={0}
          max={1}
          step={step}
        />
        <TextField
          className={classes.input}
          type="number"
          size="small"
          margin="none"
          variant="outlined"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          inputProps={{
            step,
            min: 0,
            max: 1,
          }}
        />
      </div>
    </>
  );
}

SlideBar.propTypes = {
  partName: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  isChosen: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired,
  handleChangeValue: PropTypes.func.isRequired,
  handleChosenPart: PropTypes.func.isRequired,
};
