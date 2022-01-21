"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
// mui
const styles_1 = require("@material-ui/styles");
const Typography_1 = __importDefault(require("@material-ui/core/Typography"));
// components
const timeController_1 = __importDefault(require("./timeController"));
const tools_1 = __importDefault(require("../tools"));
const markerSwitch_1 = __importDefault(require("../wavesurfer/markerSwitch"));
const useStyles = (0, styles_1.makeStyles)({
    flex: {
        display: "flex",
        alignItems: "center",
    },
    title: {
        marginLeft: 24,
        marginRight: 24,
    },
});
/**
 * Top Bar, include title, timeController, upload/download btn
 */
function Bar() {
    const classes = useStyles();
    return (react_1.default.createElement("div", { className: classes.flex },
        react_1.default.createElement(Typography_1.default, { className: classes.title, variant: "h5", color: "initial" },
            " ",
            "2021 NTUEE LightDance"),
        react_1.default.createElement(timeController_1.default, null),
        react_1.default.createElement(tools_1.default, null),
        react_1.default.createElement(markerSwitch_1.default, null)));
}
exports.default = Bar;
