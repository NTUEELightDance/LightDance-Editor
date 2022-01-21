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
const FormGroup_1 = __importDefault(require("@material-ui/core/FormGroup"));
const FormControlLabel_1 = __importDefault(require("@material-ui/core/FormControlLabel"));
const Checkbox_1 = __importDefault(require("@material-ui/core/Checkbox"));
const Button_1 = __importDefault(require("@material-ui/core/Button"));
// redux selector and actions
const globalSlice_1 = require("../../slices/globalSlice");
const loadSlice_1 = require("../../slices/loadSlice");
function SelectDancer() {
    // redux states
    const { selected } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    const { dancerNames } = (0, react_redux_1.useSelector)(loadSlice_1.selectLoad);
    const dispatch = (0, react_redux_1.useDispatch)();
    // selected
    const handleToggleSelected = (name) => {
        dispatch((0, globalSlice_1.toggleSelected)(name));
    };
    const handleSelectAll = () => {
        dispatch((0, globalSlice_1.setSelected)(dancerNames));
    };
    const handleCancelSelect = () => {
        dispatch((0, globalSlice_1.setSelected)([]));
    };
    // keyDown to select (0 ~ 9)
    const handleKeyDown = (e) => {
        const index = e.keyCode - 48;
        if (index >= 0 && index < dancerNames.length)
            // between 0 ~ 9
            handleToggleSelected(dancerNames[index]);
    };
    (0, react_1.useEffect)(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(FormGroup_1.default, { row: true }, dancerNames.map((name) => (react_1.default.createElement(FormControlLabel_1.default, { key: name, control: react_1.default.createElement(Checkbox_1.default, { color: "primary", onChange: () => handleToggleSelected(name), checked: selected.includes(name) }), label: name })))),
        react_1.default.createElement(Button_1.default, { variant: "outlined", size: "small", onClick: handleSelectAll }, "Select All"),
        react_1.default.createElement(Button_1.default, { variant: "outlined", size: "small", onClick: handleCancelSelect }, "Cancel All")));
}
exports.default = SelectDancer;
