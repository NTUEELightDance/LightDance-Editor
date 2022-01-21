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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaveSurferAppContext = void 0;
const react_1 = __importStar(require("react"));
exports.WaveSurferAppContext = (0, react_1.createContext)(null);
// export { WebSocketContext };
function WaveSurfer({ children }) {
    const [waveSurferApp, setWaveSurferApp] = (0, react_1.useState)(null);
    const [markersToggle, toggleMarkers] = (0, react_1.useState)(true);
    const initWaveSurferApp = (wave) => {
        setWaveSurferApp(wave);
    };
    return (react_1.default.createElement(exports.WaveSurferAppContext.Provider, { value: { waveSurferApp, markersToggle, initWaveSurferApp, toggleMarkers } }, children));
}
exports.default = WaveSurfer;
