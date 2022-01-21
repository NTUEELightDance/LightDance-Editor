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
const Button_1 = __importDefault(require("@material-ui/core/Button"));
// redux selector and actions
const globalSlice_1 = require("../../slices/globalSlice");
// components
const selectDancer_1 = __importDefault(require("./selectDancer"));
const el_1 = __importDefault(require("./el"));
const led_1 = __importDefault(require("./led"));
const modeSelector_1 = __importDefault(require("../modeSelector"));
const fade_1 = __importDefault(require("./fade"));
// constants
const store_1 = __importDefault(require("../../store"));
const useStyles = (0, styles_1.makeStyles)((theme) => ({
    root: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing(1),
    },
    selectDancer: {
        position: "fixed",
    },
    switches: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
    grow: {
        flexGrow: 1,
    },
    fixed: {
        position: "fixed",
    },
}));
/**
 * LightEditor
 */
function LightEditor() {
    // styles
    const classes = useStyles();
    // redux
    const dispatch = (0, react_redux_1.useDispatch)();
    // switch between ElEditor and LedEditor
    const ELEDITOR = "EL Editor";
    const LEDEDITOR = "Led Editor";
    const [editor, setEditor] = (0, react_1.useState)(ELEDITOR);
    const handleChangeEditor = () => {
        setEditor(editor === ELEDITOR ? LEDEDITOR : ELEDITOR);
    };
    // save
    const handleSave = () => {
        const status = store_1.default.getState().global.currentStatus;
        const { controlFrame, time } = store_1.default.getState().global.timeData;
        dispatch((0, globalSlice_1.saveCurrentStatus)({ status, frame: controlFrame, time }));
        dispatch((0, globalSlice_1.saveCurrentFade)());
    };
    // delete
    const handleDelete = () => {
        if (window.confirm(`Are you sure to delete ?`)) {
            dispatch((0, globalSlice_1.deleteCurrentStatus)());
        }
    };
    // TODO: make ModeSelector and  selectDancer fixed position
    return (react_1.default.createElement("div", { id: "editor", className: classes.root },
        react_1.default.createElement("div", null,
            react_1.default.createElement(modeSelector_1.default, { handleSave: handleSave, handleDelete: handleDelete }),
            react_1.default.createElement(selectDancer_1.default, { className: classes.selectDancer })),
        react_1.default.createElement("div", { className: classes.grow },
            react_1.default.createElement("div", null,
                react_1.default.createElement("div", { className: classes.switches },
                    react_1.default.createElement(Button_1.default, { variant: "text", onClick: handleChangeEditor }, editor),
                    react_1.default.createElement(fade_1.default, null)),
                editor === ELEDITOR ? react_1.default.createElement(el_1.default, null) : react_1.default.createElement(led_1.default, null)))));
}
exports.default = LightEditor;
