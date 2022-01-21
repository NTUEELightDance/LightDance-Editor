"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const flexlayout_react_1 = __importDefault(require("flexlayout-react"));
// config
require("flexlayout-react/style/dark.css");
require("./layout.css");
const layoutConfig_json_1 = __importDefault(require("./layoutConfig.json"));
// components
const simulator_1 = __importDefault(require("./components/simulator"));
const wavesurfer_1 = __importDefault(require("./components/wavesurfer"));
const lightPresets_1 = __importDefault(require("./components/presets/lightPresets"));
const posPresets_1 = __importDefault(require("./components/presets/posPresets"));
const lightEditor_1 = __importDefault(require("./components/lightEditor"));
const posEditor_1 = __importDefault(require("./components/posEditor"));
const file_1 = __importDefault(require("./components/file"));
const commandCenter_1 = __importDefault(require("./components/commandCenter"));
function Layout() {
    // layout
    const factory = (node) => {
        const component = node.getComponent();
        switch (component) {
            case "CommandCenter":
                return react_1.default.createElement(commandCenter_1.default, null);
            case "Simulator":
                return react_1.default.createElement(simulator_1.default, null);
            case "LightEditor":
                return react_1.default.createElement(lightEditor_1.default, null);
            case "PosEditor":
                return react_1.default.createElement(posEditor_1.default, null);
            case "Wavesurfer":
                return react_1.default.createElement(wavesurfer_1.default, null);
            case "LightPresets":
                return react_1.default.createElement(lightPresets_1.default, null);
            case "PosPresets":
                return react_1.default.createElement(posPresets_1.default, null);
            case "File":
                return react_1.default.createElement(file_1.default, null);
            default:
                return null;
        }
    };
    return (react_1.default.createElement(flexlayout_react_1.default.Layout, { model: flexlayout_react_1.default.Model.fromJson(layoutConfig_json_1.default), factory: factory, font: { size: "12px" } }));
}
exports.default = Layout;
