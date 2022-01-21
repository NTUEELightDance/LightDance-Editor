"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable jsx-a11y/click-events-have-key-events */
const react_1 = __importDefault(require("react"));
const prop_types_1 = __importDefault(require("prop-types"));
// mui
const styles_1 = require("@material-ui/core/styles");
const TextField_1 = __importDefault(require("@material-ui/core/TextField"));
const Typography_1 = __importDefault(require("@material-ui/core/Typography"));
const Slider_1 = __importDefault(require("@material-ui/core/Slider"));
const useStyles = (0, styles_1.makeStyles)((theme) => ({
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
function SlideBar({ partName, disabled, isChosen, value, handleChangeValue, handleChosenPart, }) {
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
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(Typography_1.default, { onClick: handleMultiChoose, variant: "body1", style: {
                cursor: "pointer",
                boxShadow: isChosen ? "0 0 0 0.25rem rgb(13 110 253 / 25%)" : "none",
            } }, partName),
        react_1.default.createElement("div", { style: { display: "flex", alignItems: "center" } },
            react_1.default.createElement(Slider_1.default, { className: classes.slider, value: value, 
                // onMouseOver={enableWheel}
                // onMouseOut={disableWheel}
                onChange: handleSlideChange, disabled: disabled, min: 0, max: 1, step: step }),
            react_1.default.createElement(TextField_1.default, { className: classes.input, type: "number", size: "small", margin: "none", variant: "outlined", value: value, onChange: handleInputChange, disabled: disabled, inputProps: {
                    step,
                    min: 0,
                    max: 1,
                } }))));
}
exports.default = SlideBar;
SlideBar.propTypes = {
    partName: prop_types_1.default.string.isRequired,
    disabled: prop_types_1.default.bool.isRequired,
    isChosen: prop_types_1.default.bool.isRequired,
    value: prop_types_1.default.number.isRequired,
    handleChangeValue: prop_types_1.default.func.isRequired,
    handleChosenPart: prop_types_1.default.func.isRequired,
};
