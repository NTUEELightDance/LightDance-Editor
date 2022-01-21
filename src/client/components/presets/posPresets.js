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
const Button_1 = __importDefault(require("@material-ui/core/Button"));
const Dialog_1 = __importDefault(require("@material-ui/core/Dialog"));
const DialogTitle_1 = __importDefault(require("@material-ui/core/DialogTitle"));
const DialogContent_1 = __importDefault(require("@material-ui/core/DialogContent"));
const DialogActions_1 = __importDefault(require("@material-ui/core/DialogActions"));
const TextField_1 = __importDefault(require("@material-ui/core/TextField"));
// action and selector
const globalSlice_1 = require("../../slices/globalSlice");
const loadSlice_1 = require("../../slices/loadSlice");
// utils
const localStorage_1 = require("../../utils/localStorage");
// components
const presetsList_1 = __importDefault(require("./presetsList"));
/**
 * This is Presets component, list of pos
 * @component
 */
function PosPresets() {
    const dispatch = (0, react_redux_1.useDispatch)();
    // presets intialize
    // get loadedPresets or storagePresets
    const { posPresets: loadedPosPresets } = (0, react_redux_1.useSelector)(loadSlice_1.selectLoad);
    const { posPresets } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    (0, react_1.useEffect)(() => {
        if ((0, localStorage_1.getItem)("posPresets")) {
            dispatch((0, globalSlice_1.setPosPresets)(JSON.parse((0, localStorage_1.getItem)("posPresets"))));
        }
        else {
            dispatch((0, globalSlice_1.setPosPresets)(loadedPosPresets));
        }
    }, []);
    // dialog
    const [open, setOpen] = (0, react_1.useState)(false);
    const [nameVal, setNameVal] = (0, react_1.useState)("");
    const openDialog = () => setOpen(true);
    const closeDialog = () => {
        setOpen(false);
        setNameVal("");
    };
    const handleChangeName = (e) => setNameVal(e.target.value);
    // dispatch
    const handleAddPresets = (name) => {
        if (name.trim() !== "")
            dispatch((0, globalSlice_1.addPosPresets)(name));
        closeDialog();
    };
    const handleEditPresets = (name, idx) => {
        dispatch((0, globalSlice_1.editPosPresetsName)({ name, idx }));
        closeDialog();
    };
    const handleDeletePresets = (idx) => {
        dispatch((0, globalSlice_1.deletePosPresets)(idx));
    };
    const handleSetCurrentPos = (pos) => {
        dispatch((0, globalSlice_1.setCurrentPos)(pos));
    };
    // short cut of key to save currentPos
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", { style: { padding: 8 } },
            react_1.default.createElement(Button_1.default, { variant: "outlined", size: "small", onClick: openDialog }, "Add"),
            react_1.default.createElement(presetsList_1.default, { presets: posPresets, handleEditPresets: handleEditPresets, handleDeletePresets: handleDeletePresets, handleSetCurrent: handleSetCurrentPos })),
        react_1.default.createElement("div", null,
            react_1.default.createElement(Dialog_1.default, { fullWidth: true, size: "md", open: open, onClose: closeDialog },
                react_1.default.createElement(DialogTitle_1.default, null, "Preset name"),
                react_1.default.createElement(DialogContent_1.default, null,
                    react_1.default.createElement(TextField_1.default, { fullWidth: true, value: nameVal, onChange: handleChangeName })),
                react_1.default.createElement(DialogActions_1.default, null,
                    react_1.default.createElement(Button_1.default, { onClick: () => handleAddPresets(nameVal) }, "OK"))))));
}
exports.default = PosPresets;
