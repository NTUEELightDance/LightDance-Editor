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
// redux
const react_redux_1 = require("react-redux");
// material ui
const Button_1 = __importDefault(require("@material-ui/core/Button"));
const Dialog_1 = __importDefault(require("@material-ui/core/Dialog"));
const DialogTitle_1 = __importDefault(require("@material-ui/core/DialogTitle"));
const DialogContent_1 = __importDefault(require("@material-ui/core/DialogContent"));
const TextField_1 = __importDefault(require("@material-ui/core/TextField"));
// slices
const globalSlice_1 = require("../../../slices/globalSlice");
const CONTROL = "control";
const POSITION = "position";
function TimeShift({ open, handleClose }) {
    const dispatch = (0, react_redux_1.useDispatch)();
    const { controlRecord, positionRecord } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    // type
    const [type, setType] = (0, react_1.useState)(CONTROL); // another is POSITION
    const handleChangeType = () => setType(type === CONTROL ? POSITION : CONTROL);
    // frame index
    const [startFrame, setStartFrame] = (0, react_1.useState)(0);
    const [endFrame, setEndFrame] = (0, react_1.useState)(0);
    const handleChangeStartFrame = (e) => setStartFrame(e.target.value);
    const handleChangeEndFrame = (e) => setEndFrame(e.target.value);
    // time
    const [shiftTime, setShiftTime] = (0, react_1.useState)(0);
    const handleChangeShiftTime = (e) => setShiftTime(e.target.value);
    // submit
    const submitTimeShift = (e) => {
        e.preventDefault();
        const record = type === CONTROL ? controlRecord : positionRecord;
        if (startFrame < 0 || startFrame >= record.length) {
            window.alert("Invalid start frame");
            return;
        }
        if (endFrame < 0 || endFrame >= record.length) {
            window.alert("Invalid end frame");
            return;
        }
        if (startFrame > endFrame) {
            window.alert("Invalid, startFrame should <= endFrame");
            return;
        }
        // TODO: dispatch
        dispatch((0, globalSlice_1.shiftFrameTime)({ type, startFrame, endFrame, shiftTime }));
        handleClose();
    };
    return (react_1.default.createElement(Dialog_1.default, { open: open, onClose: handleClose },
        react_1.default.createElement(DialogTitle_1.default, null, " Time Shift Tool"),
        react_1.default.createElement(DialogContent_1.default, null,
            react_1.default.createElement("form", { onSubmit: submitTimeShift },
                react_1.default.createElement("div", { style: {
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    } },
                    react_1.default.createElement(Button_1.default, { onClick: handleChangeType, size: "small", variant: "outlined" }, type),
                    react_1.default.createElement("br", null),
                    react_1.default.createElement(TextField_1.default, { type: "number", label: "startFrame", onChange: handleChangeStartFrame, value: startFrame }),
                    react_1.default.createElement("br", null),
                    react_1.default.createElement(TextField_1.default, { type: "number", label: "endFrame", onChange: handleChangeEndFrame, value: endFrame }),
                    react_1.default.createElement("br", null),
                    react_1.default.createElement(TextField_1.default, { type: "number", label: "shiftTime (ms)", onChange: handleChangeShiftTime, value: shiftTime }),
                    react_1.default.createElement("br", null),
                    react_1.default.createElement(Button_1.default, { type: "submit" }, "OK"))))));
}
exports.default = TimeShift;
