"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const Switch_1 = __importDefault(require("@material-ui/core/Switch"));
const FormControlLabel_1 = __importDefault(require("@material-ui/core/FormControlLabel"));
// redux selector and actions
const globalSlice_1 = require("../../slices/globalSlice");
// constants
const constants_1 = require("../../constants");
/**
 * Fade button
 * @component
 */
function Fade() {
    const dispatch = (0, react_redux_1.useDispatch)();
    const { mode, currentFade } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    // handle action
    const handleSwitchFade = () => {
        dispatch((0, globalSlice_1.setCurrentFade)(!currentFade));
    };
    return (react_1.default.createElement(FormControlLabel_1.default, { control: react_1.default.createElement(Switch_1.default, { checked: currentFade, disabled: mode === constants_1.IDLE, onChange: handleSwitchFade, name: "switchFade", color: "primary" }), label: "fade" }));
}
exports.default = Fade;
