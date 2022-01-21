"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const clsx_1 = __importDefault(require("clsx"));
// redux
const react_redux_1 = require("react-redux");
// mui
const styles_1 = require("@material-ui/styles");
const Typography_1 = __importDefault(require("@material-ui/core/Typography"));
const TextField_1 = __importDefault(require("@material-ui/core/TextField"));
const IconButton_1 = __importDefault(require("@material-ui/core/IconButton"));
const ChevronLeft_1 = __importDefault(require("@material-ui/icons/ChevronLeft"));
const ChevronRight_1 = __importDefault(require("@material-ui/icons/ChevronRight"));
// actions and selector
const globalSlice_1 = require("../../slices/globalSlice");
// constant
const constants_1 = require("../../constants");
const useStyles = (0, styles_1.makeStyles)((theme) => ({
    flex: {
        display: "flex",
        alignItems: "center",
    },
    frameBtn: {
        height: "100%",
    },
    marginTB: {
        marginTop: theme.spacing(1),
        marginButton: theme.spacing(1),
    },
    marginLR: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    input: {
        width: "120px",
    },
}));
/**
 * Time Data Controller (time, controlFrame, posFrame)
 */
function TimeController() {
    // styles
    const classes = useStyles();
    // redux
    const dispatch = (0, react_redux_1.useDispatch)();
    const { timeData: { time, controlFrame, posFrame }, } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    // constant
    const from = constants_1.TIMECONTROLLER;
    // handle Change
    const handleChangeTime = (value) => {
        dispatch((0, globalSlice_1.setTime)({
            from,
            time: parseInt(value, 10),
        }));
    };
    const handleChangeControlFrame = (value) => {
        dispatch((0, globalSlice_1.setControlFrame)({
            from,
            controlFrame: parseInt(value, 10),
        }));
    };
    const handleChangePosFrame = (value) => {
        dispatch((0, globalSlice_1.setPosFrame)({
            from,
            posFrame: parseInt(value, 10),
        }));
    };
    return (react_1.default.createElement("div", { className: classes.flex },
        react_1.default.createElement("div", { className: (0, clsx_1.default)(classes.flex, classes.marginLR) },
            react_1.default.createElement(Typography_1.default, { variant: "body1", color: "initial" },
                "time:",
                " "),
            react_1.default.createElement(TextField_1.default, { className: classes.input, size: "small", margin: "none", variant: "outlined", type: "number", placeholder: "time", value: time, inputProps: { min: 0 }, onChange: (e) => handleChangeTime(e.target.value) })),
        react_1.default.createElement("div", { className: (0, clsx_1.default)(classes.flex, classes.marginLR) },
            react_1.default.createElement(Typography_1.default, { variant: "body1", color: "initial" }, "controlFrame:"),
            react_1.default.createElement("div", { className: classes.flex },
                react_1.default.createElement(IconButton_1.default, { className: classes.frameBtn, variant: "outlined", onClick: () => handleChangeControlFrame(controlFrame - 1) },
                    react_1.default.createElement(ChevronLeft_1.default, null)),
                react_1.default.createElement(TextField_1.default, { className: classes.input, size: "small", margin: "none", variant: "outlined", type: "number", placeholder: "status index", value: controlFrame, inputProps: { min: 0 }, onChange: (e) => handleChangeControlFrame(e.target.value) }),
                react_1.default.createElement(IconButton_1.default, { className: classes.frameBtn, variant: "outlined", onClick: () => handleChangeControlFrame(controlFrame + 1) },
                    react_1.default.createElement(ChevronRight_1.default, null)))),
        react_1.default.createElement("div", { className: (0, clsx_1.default)(classes.flex, classes.marginLR) },
            react_1.default.createElement(Typography_1.default, { variant: "body1", color: "initial" }, "posFrame:"),
            react_1.default.createElement("div", { className: classes.flex },
                react_1.default.createElement(IconButton_1.default, { className: classes.frameBtn, variant: "outlined", onClick: () => handleChangePosFrame(posFrame - 1) },
                    react_1.default.createElement(ChevronLeft_1.default, null)),
                react_1.default.createElement(TextField_1.default, { className: classes.input, size: "small", margin: "none", variant: "outlined", type: "number", placeholder: "position index", value: posFrame, inputProps: { min: 0 }, onChange: (e) => handleChangePosFrame(e.target.value) }),
                react_1.default.createElement(IconButton_1.default, { className: classes.frameBtn, variant: "outlined", onClick: () => handleChangePosFrame(posFrame + 1) },
                    react_1.default.createElement(ChevronRight_1.default, null))))));
}
exports.default = TimeController;
