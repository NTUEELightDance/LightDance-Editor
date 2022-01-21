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
const Table_1 = __importDefault(require("@material-ui/core/Table"));
const TableBody_1 = __importDefault(require("@material-ui/core/TableBody"));
const TableCell_1 = __importDefault(require("@material-ui/core/TableCell"));
const TableContainer_1 = __importDefault(require("@material-ui/core/TableContainer"));
const TableHead_1 = __importDefault(require("@material-ui/core/TableHead"));
const TableRow_1 = __importDefault(require("@material-ui/core/TableRow"));
const Paper_1 = __importDefault(require("@material-ui/core/Paper"));
const Checkbox_1 = __importDefault(require("@material-ui/core/Checkbox"));
const TextField_1 = __importDefault(require("@material-ui/core/TextField"));
// command api
const agent_1 = __importDefault(require("./agent"));
// redux selector and actions
const globalSlice_1 = require("../../slices/globalSlice");
const commandSlice_1 = require("../../slices/commandSlice");
// contants
const wavesurferContext_1 = require("../../contexts/wavesurferContext");
const COMMANDS = require("../../../constant");
// contexts
const useStyles = (0, styles_1.makeStyles)((theme) => ({
    commands: {
        display: "inline-block",
        padding: theme.spacing(0.5),
    },
    btns: {
        textTransform: "none",
    },
    root: {
        display: "inline-block",
        padding: theme.spacing(0.5),
        width: "100px",
    },
    mediumCell: {
        width: "160px",
        textAlign: "center",
    },
    table: {
        backgroundColor: "black",
    },
}));
/**
 * CommandCenter
 */
function CommandCenter() {
    // styles
    const classes = useStyles();
    // redux
    const { controlRecord, currentStatus, timeData: { time }, } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    const { dancerStatus } = (0, react_redux_1.useSelector)(commandSlice_1.selectCommand);
    const dispatch = (0, react_redux_1.useDispatch)();
    // delay
    const [delay, setDelay] = (0, react_1.useState)(0);
    const [selectedDancers, setSelectedDancers] = (0, react_1.useState)([]); // array of dancerName that is selected
    const handleToggleDancer = (dancerName) => {
        if (selectedDancers.includes(dancerName)) {
            // remove from array
            setSelectedDancers(selectedDancers.filter((name) => name !== dancerName));
        }
        else
            setSelectedDancers([...selectedDancers, dancerName]); // add to array
    };
    const handleAllDancer = () => {
        if (selectedDancers.length) {
            setSelectedDancers([]); // clear all
        }
        else {
            // select all
            setSelectedDancers(Object.keys(dancerStatus));
        }
    };
    // wavesurfer for play pause
    const { waveSurferApp } = (0, react_1.useContext)(wavesurferContext_1.WaveSurferAppContext);
    const handlePlay = () => waveSurferApp.play();
    const handlePause = () => waveSurferApp.pause();
    const handleStop = () => waveSurferApp.stop();
    // click btn, will call api to server
    const handleClickBtn = (command) => {
        dispatch((0, commandSlice_1.clearDancerStatusMsg)({
            dancerNames: selectedDancers,
        }));
        const de = delay !== "" ? parseInt(delay, 10) : 0;
        const sysTime = de + Date.now();
        const dataToServer = {
            selectedDancers,
            startTime: time,
            delay: de,
            sysTime,
            controlJson: controlRecord,
            lightCurrentStatus: currentStatus,
        };
        agent_1.default[command](dataToServer);
        // play or pause or stop
        if (command === COMMANDS.PLAY) {
            console.log(`Start to play at delay ${delay}`);
            setTimeout(() => handlePlay(), delay);
        }
        else if (command === COMMANDS.PAUSE) {
            handlePause();
        }
        else if (command === COMMANDS.STOP) {
            handleStop();
        }
    };
    return (react_1.default.createElement("div", { style: { padding: "16px" } },
        react_1.default.createElement(TextField_1.default, { size: "small", type: "number", className: classes.root, label: "delay(ms)", onChange: (e) => {
                setDelay(e.target.value);
            } }),
        Object.values(COMMANDS).map((command) => {
            return (react_1.default.createElement("div", { className: classes.commands, key: command },
                react_1.default.createElement(Button_1.default, { className: classes.btns, variant: "outlined", onClick: (e) => handleClickBtn(command) }, command)));
        }),
        react_1.default.createElement(TableContainer_1.default, { component: Paper_1.default },
            react_1.default.createElement(Table_1.default, { className: classes.table, size: "small" },
                react_1.default.createElement(TableHead_1.default, null,
                    react_1.default.createElement(TableRow_1.default, null,
                        react_1.default.createElement(TableCell_1.default, { padding: "checkbox" },
                            react_1.default.createElement(Checkbox_1.default, { onChange: handleAllDancer })),
                        react_1.default.createElement(TableCell_1.default, { className: classes.mediumCell }, "DancerName"),
                        react_1.default.createElement(TableCell_1.default, { className: classes.mediumCell }, "HostName"),
                        react_1.default.createElement(TableCell_1.default, { className: classes.mediumCell }, "IP"),
                        react_1.default.createElement(TableCell_1.default, { className: classes.mediumCell }, "Status"),
                        react_1.default.createElement(TableCell_1.default, null, "Message"))),
                react_1.default.createElement(TableBody_1.default, null, Object.entries(dancerStatus).map(([dancerName, { hostname, ip, OK, msg, isConnected }]) => {
                    const isItemSelected = selectedDancers.includes(dancerName);
                    return (react_1.default.createElement(TableRow_1.default, { key: dancerName, hover: true, onClick: () => handleToggleDancer(dancerName), role: "checkbox", selected: isItemSelected },
                        react_1.default.createElement(TableCell_1.default, { padding: "checkbox" },
                            react_1.default.createElement(Checkbox_1.default, { checked: isItemSelected })),
                        react_1.default.createElement(TableCell_1.default, { className: classes.mediumCell }, dancerName),
                        react_1.default.createElement(TableCell_1.default, { className: classes.mediumCell }, hostname),
                        react_1.default.createElement(TableCell_1.default, { className: classes.mediumCell }, ip),
                        react_1.default.createElement(TableCell_1.default, { className: classes.mediumCell }, isConnected ? (react_1.default.createElement("span", { style: { color: "green" } }, "Connected")) : (react_1.default.createElement("span", { style: { color: "red" } }, "Disconnected"))),
                        react_1.default.createElement(TableCell_1.default, null,
                            react_1.default.createElement("p", { style: { color: OK ? "green" : "red" } }, msg))));
                }))))));
}
exports.default = CommandCenter;
