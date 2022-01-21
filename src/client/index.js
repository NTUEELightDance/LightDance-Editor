"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const react_redux_1 = require("react-redux");
const store_1 = __importDefault(require("./store"));
// test for websocket
const webSocketContext_1 = __importDefault(require("./contexts/webSocketContext"));
const wavesurferContext_1 = __importDefault(require("./contexts/wavesurferContext"));
const app_1 = __importDefault(require("./app"));
const Index = () => (react_1.default.createElement(react_redux_1.Provider, { store: store_1.default },
    react_1.default.createElement(webSocketContext_1.default, null,
        react_1.default.createElement(wavesurferContext_1.default, null,
            react_1.default.createElement(app_1.default, null)))));
react_dom_1.default.render(react_1.default.createElement(Index, null), document.getElementById("app"));
