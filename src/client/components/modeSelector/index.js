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
const prop_types_1 = __importDefault(require("prop-types"));
const react_redux_1 = require("react-redux");
// mui
const Button_1 = __importDefault(require("@material-ui/core/Button"));
// redux selector and actions
const globalSlice_1 = require("../../slices/globalSlice");
// constants
const constants_1 = require("../../constants");
function ModeSelector({ handleSave, handleDelete }) {
    // redux states
    const { mode } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    const dispatch = (0, react_redux_1.useDispatch)();
    // mode
    const handleChangeMode = (m) => {
        dispatch((0, globalSlice_1.toggleMode)(m));
    };
    const handleSaveToLocal = () => {
        dispatch((0, globalSlice_1.saveToLocal)());
    };
    // keyDown to change mode (include multiple keyDown)
    const handleKeyDown = (e) => {
        if (e.code === "KeyE")
            handleChangeMode(constants_1.EDIT);
        else if (e.code === "KeyA")
            handleChangeMode(constants_1.ADD);
        else if (e.code === "KeyS" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSave();
        }
        else if (e.code === "Delete")
            handleDelete();
    };
    (0, react_1.useEffect)(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(Button_1.default, { variant: "outlined", size: "small", color: mode === constants_1.EDIT ? "secondary" : "", onClick: () => handleChangeMode(constants_1.EDIT) }, mode === constants_1.EDIT ? "Cancel" : "EDIT"),
        react_1.default.createElement(Button_1.default, { variant: "outlined", size: "small", color: mode === constants_1.ADD ? "secondary" : "", onClick: () => handleChangeMode(constants_1.ADD) }, mode === constants_1.ADD ? "Cancel" : "ADD"),
        react_1.default.createElement(Button_1.default, { variant: "outlined", size: "small", color: "primary", disabled: mode === constants_1.IDLE, onClick: handleSave }, "SAVE"),
        react_1.default.createElement(Button_1.default, { size: "small", variant: "outlined", color: "secondary", onClick: handleDelete, disabled: mode !== constants_1.IDLE }, "DEL"),
        react_1.default.createElement(Button_1.default, { size: "small", variant: "outlined", color: "primary", onClick: handleSaveToLocal, disabled: false }, "SAVE_LOCAL")));
}
exports.default = ModeSelector;
ModeSelector.propTypes = {
    handleSave: prop_types_1.default.func.isRequired,
    handleDelete: prop_types_1.default.func.isRequired,
};
