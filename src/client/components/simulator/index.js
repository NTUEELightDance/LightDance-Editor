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
// redux
const react_redux_1 = require("react-redux");
// actions
const globalSlice_1 = require("../../slices/globalSlice");
// my-class
const controller_1 = __importDefault(require("./controller"));
// useSelector
/**
 * This is Display component
 *
 * @component
 */
function Simulator() {
    const { currentStatus, currentPos } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    const [controller, setController] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const newController = new controller_1.default();
        newController.init();
        setController(newController);
    }, []);
    (0, react_1.useEffect)(() => {
        if (controller) {
            controller.updateDancersStatus(currentStatus);
        }
    }, [controller, currentStatus]);
    (0, react_1.useEffect)(() => {
        if (controller) {
            controller.updateDancersPos(currentPos);
        }
    }, [controller, currentPos]);
    return (react_1.default.createElement("div", { style: {
            height: "100%",
            width: "100%",
        } },
        react_1.default.createElement("div", { id: "pixi", style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
            } },
            react_1.default.createElement("div", { id: "main_stage" }))));
}
exports.default = Simulator;
