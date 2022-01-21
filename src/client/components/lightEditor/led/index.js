"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
// mui
const styles_1 = require("@material-ui/core/styles");
const FormControl_1 = __importDefault(require("@material-ui/core/FormControl"));
const Select_1 = __importDefault(require("@material-ui/core/Select"));
const MenuItem_1 = __importDefault(require("@material-ui/core/MenuItem"));
// redux selector and actions
const globalSlice_1 = require("../../../slices/globalSlice");
const loadSlice_1 = require("../../../slices/loadSlice");
// components
const slidebar_1 = __importDefault(require("../slidebar"));
// constants
const constants_1 = require("../../../constants");
const useStyles = (0, styles_1.makeStyles)((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
}));
/**
 * Led parts' slidebar list and selector
 */
function LedEditor() {
    // classes
    const classes = useStyles();
    // redux states
    const dispatch = (0, react_redux_1.useDispatch)();
    const { dancers, texture } = (0, react_redux_1.useSelector)(loadSlice_1.selectLoad);
    const { mode, currentStatus, selected } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    // selected dancers' ledparts
    const [intersectParts, setIntersectParts] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (selected.length) {
            // pick intersection parts
            const elParts = selected.map((dancerName) => 
            // eslint-disable-next-line dot-notation
            Object.keys(dancers[dancerName]["LEDPARTS"]));
            setIntersectParts(elParts.reduce((a, b) => a.filter((c) => b.includes(c))));
        }
        else
            setIntersectParts([]);
    }, [selected]);
    // multi chosen ledparts
    const [chosenParts, setChosenParts] = (0, react_1.useState)([]);
    const handleChosenPart = (partName) => {
        if (chosenParts.includes(partName))
            setChosenParts(chosenParts.filter((n) => n !== partName));
        else {
            setChosenParts([...chosenParts, partName]);
        }
    };
    // clear chosen ledparts by key "esc"
    const handleClearChosenPart = (e) => {
        if (e.key === "Escape")
            setChosenParts([]);
    };
    (0, react_1.useEffect)(() => {
        window.addEventListener("keydown", handleClearChosenPart);
        return () => {
            window.removeEventListener("keydown", handleClearChosenPart);
        };
    }, []);
    // changeStatus
    // led value: { src, alpha }
    const handleChangeAlpha = (partName, alpha) => {
        // TODO
        selected.forEach((dancerName) => {
            // if chosenParts not empty => change all chosenParts value
            if (chosenParts.length)
                chosenParts.forEach((chosenPartName) => {
                    dispatch((0, globalSlice_1.editCurrentStatusLED)({
                        dancerName,
                        partName: chosenPartName,
                        value: { alpha },
                    }));
                });
            // only one change
            else
                dispatch((0, globalSlice_1.editCurrentStatusLED)({ dancerName, partName, value: { alpha } }));
        });
    };
    const handleChangeSrc = (partName, src) => {
        selected.forEach((dancerName) => {
            dispatch((0, globalSlice_1.editCurrentStatusLED)({ dancerName, partName, value: { src } }));
        });
    };
    // TODO: change texture
    return (react_1.default.createElement("div", { className: classes.root }, selected.length
        ? intersectParts.map((partName) => (react_1.default.createElement("div", { style: { marginBottom: 16 } },
            react_1.default.createElement(slidebar_1.default, { key: partName, partName: partName, disabled: mode === constants_1.IDLE, isChosen: chosenParts.includes(partName), value: currentStatus[selected[0]][partName].alpha, handleChosenPart: handleChosenPart, handleChangeValue: handleChangeAlpha }),
            react_1.default.createElement(FormControl_1.default, null,
                react_1.default.createElement(Select_1.default, { disabled: mode === constants_1.IDLE, value: currentStatus[selected[0]][partName].src, onChange: (e) => handleChangeSrc(partName, e.target.value) }, texture["LEDPARTS"][partName].name.map((name) => (react_1.default.createElement(MenuItem_1.default, { key: name, value: name }, name))))))))
        : null));
}
exports.default = LedEditor;
