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
// styles
const styles_1 = require("@material-ui/core/styles");
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
 * EL parts' slidebar list
 */
function ElEditor() {
    // classes
    const classes = useStyles();
    // redux states
    const dispatch = (0, react_redux_1.useDispatch)();
    const { dancers } = (0, react_redux_1.useSelector)(loadSlice_1.selectLoad);
    const { mode, currentStatus, selected } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    // selected dancers' elparts
    const [intersectParts, setIntersectParts] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        if (selected.length) {
            // pick intersection parts
            const elParts = selected.map((dancerName) => 
            // eslint-disable-next-line dot-notation
            Object.keys(dancers[dancerName]["ELPARTS"]));
            setIntersectParts(elParts.reduce((a, b) => a.filter((c) => b.includes(c))));
        }
        else
            setIntersectParts([]);
    }, [selected]);
    // multi chosen elparts
    const [chosenParts, setChosenParts] = (0, react_1.useState)([]);
    const handleChosenPart = (partName) => {
        if (chosenParts.includes(partName))
            setChosenParts(chosenParts.filter((n) => n !== partName));
        else {
            setChosenParts([...chosenParts, partName]);
        }
    };
    // clear chosen elparts by key "esc"
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
    const handleChangeValue = (partName, value) => {
        selected.forEach((dancerName) => {
            // if chosenParts not empty => change all chosenParts value
            if (chosenParts.length)
                chosenParts.forEach((chosenPartName) => {
                    dispatch((0, globalSlice_1.editCurrentStatus)({ dancerName, partName: chosenPartName, value }));
                });
            // only one change
            else
                dispatch((0, globalSlice_1.editCurrentStatus)({ dancerName, partName, value }));
        });
    };
    return (react_1.default.createElement("div", { className: classes.root }, selected.length
        ? intersectParts.map((partName) => (react_1.default.createElement(slidebar_1.default, { key: partName, partName: partName, disabled: mode === constants_1.IDLE, isChosen: chosenParts.includes(partName), value: currentStatus[selected[0]][partName], handleChosenPart: handleChosenPart, handleChangeValue: handleChangeValue })))
        : null));
}
exports.default = ElEditor;
