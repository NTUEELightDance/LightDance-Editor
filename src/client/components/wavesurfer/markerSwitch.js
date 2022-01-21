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
const react_1 = __importStar(require("react"));
const wavesurferContext_1 = require("../../contexts/wavesurferContext");
const core_1 = require("@material-ui/core");
const core_2 = require("@material-ui/core");
function MarkerSwitch() {
    const { markersToggle, toggleMarkers } = (0, react_1.useContext)(wavesurferContext_1.WaveSurferAppContext);
    //toggle markers
    const handleChange = () => {
        toggleMarkers(!markersToggle);
    };
    return (react_1.default.createElement(core_2.FormControlLabel, { control: react_1.default.createElement(core_1.Switch, { color: "primary", checked: markersToggle, onChange: handleChange }), label: "Markers", labelPlacement: "start" }));
}
exports.default = MarkerSwitch;
