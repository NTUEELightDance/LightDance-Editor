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
const PlayArrow_1 = __importDefault(require("@material-ui/icons/PlayArrow"));
const Pause_1 = __importDefault(require("@material-ui/icons/Pause"));
const Stop_1 = __importDefault(require("@material-ui/icons/Stop"));
const Loop_1 = __importDefault(require("@material-ui/icons/Loop"));
// my class
const waveSurferApp_1 = __importDefault(require("./waveSurferApp"));
const timeline_1 = __importDefault(require("./timeline"));
// selector
const globalSlice_1 = require("../../slices/globalSlice");
// constants
const constants_1 = require("../../constants");
// contexts
const wavesurferContext_1 = require("../../contexts/wavesurferContext");
/**
 *
 * This is Wave component
 * @component
 */
const Wavesurfer = () => {
    const { waveSurferApp, initWaveSurferApp, markersToggle } = (0, react_1.useContext)(wavesurferContext_1.WaveSurferAppContext);
    // const [waveSurferApp, setWaveSurferApp] = useState(null);
    (0, react_1.useEffect)(() => {
        const newWaveSurferApp = new waveSurferApp_1.default();
        newWaveSurferApp.init();
        initWaveSurferApp(newWaveSurferApp);
    }, []);
    // redux
    const { timeData: { from, time }, } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    const { controlRecord } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    //update Markers
    (0, react_1.useEffect)(() => {
        if (controlRecord && waveSurferApp && markersToggle)
            waveSurferApp.updateMarkers(controlRecord);
    }, [controlRecord]);
    //update Markers when markers switched on
    (0, react_1.useEffect)(() => {
        if (!controlRecord || !waveSurferApp)
            return;
        if (markersToggle)
            waveSurferApp.updateMarkers(controlRecord);
        else
            waveSurferApp.clearMarker();
    }, [markersToggle]);
    // listen to time set by other component
    (0, react_1.useEffect)(() => {
        if (waveSurferApp) {
            if (from !== constants_1.WAVESURFERAPP) {
                try {
                    waveSurferApp.seekTo(time);
                }
                catch (err) {
                    console.error(err);
                }
            }
        }
    }, [waveSurferApp, time]);
    // event
    const handlePlayPause = () => waveSurferApp.playPause();
    const handleStop = () => waveSurferApp.stop();
    const handlePlayLoop = () => waveSurferApp.playLoop();
    return (react_1.default.createElement("div", { style: { height: "100%" } },
        react_1.default.createElement("div", { style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "fixed",
                marginTop: "6px",
                width: "100%",
                zIndex: 10,
            } },
            react_1.default.createElement("div", { style: { marginRight: "8px" } },
                react_1.default.createElement(Button_1.default, { size: "small", variant: "text", color: "default", onClick: handlePlayPause },
                    react_1.default.createElement(PlayArrow_1.default, null),
                    " / ",
                    react_1.default.createElement(Pause_1.default, null))),
            react_1.default.createElement(Button_1.default, { size: "small", variant: "text", color: "default", onClick: handleStop },
                react_1.default.createElement(Stop_1.default, null)),
            react_1.default.createElement(Button_1.default, { size: "small", variant: "text", color: "default", onClick: handlePlayLoop },
                react_1.default.createElement(Loop_1.default, null))),
        react_1.default.createElement(timeline_1.default, { wavesurfer: waveSurferApp }),
        react_1.default.createElement("div", { id: "waveform" })));
};
exports.default = Wavesurfer;
