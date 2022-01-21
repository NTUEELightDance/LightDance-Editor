"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
const react_custom_scrollbars_1 = __importDefault(require("react-custom-scrollbars"));
// mui
const styles_1 = require("@material-ui/core/styles");
// redux selector and actions
const globalSlice_1 = require("../../slices/globalSlice");
// components
const modeSelector_1 = __importDefault(require("../modeSelector"));
const posList_1 = __importDefault(require("./posList"));
// constants
const store_1 = __importDefault(require("../../store"));
const useStyles = (0, styles_1.makeStyles)((theme) => ({
    root: {
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: theme.spacing(1),
    },
    grow: {
        flexGrow: 1,
    },
}));
function PosEditor() {
    // styles
    const classes = useStyles();
    const dispatch = (0, react_redux_1.useDispatch)();
    // save
    const handleSave = () => {
        const { currentPos } = store_1.default.getState().global;
        const { posFrame, time } = store_1.default.getState().global.timeData;
        dispatch((0, globalSlice_1.saveCurrentPos)({ currentPos, posFrame, time }));
    };
    // delete
    const handleDelete = () => {
        if (window.confirm(`Are you sure to delete ?`)) {
            dispatch((0, globalSlice_1.deleteCurrentPos)());
        }
    };
    // scroll bar config
    const renderThumb = (_a) => {
        var { style } = _a, props = __rest(_a, ["style"]);
        const thumbStyle = {
            borderRadius: 6,
            backgroundColor: "rgba(192,192,200, 0.5)",
        };
        return react_1.default.createElement("div", Object.assign({ style: Object.assign(Object.assign({}, style), thumbStyle) }, props));
    };
    return (react_1.default.createElement("div", { className: classes.root },
        react_1.default.createElement(modeSelector_1.default, { handleSave: handleSave, handleDelete: handleDelete }),
        react_1.default.createElement("div", { className: classes.grow },
            react_1.default.createElement(react_custom_scrollbars_1.default, { renderThumbVertical: renderThumb },
                react_1.default.createElement(posList_1.default, null)))));
}
exports.default = PosEditor;
