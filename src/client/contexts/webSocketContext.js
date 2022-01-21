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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketContext = void 0;
const react_1 = __importStar(require("react"));
const editorSocketAPI_1 = __importDefault(require("../websocket/editorSocketAPI"));
const commandSlice_1 = require("../slices/commandSlice");
const store_1 = __importDefault(require("../store"));
exports.WebSocketContext = (0, react_1.createContext)(null);
function WebSocket({ children }) {
    const [webSocket, setWebSocket] = (0, react_1.useState)(1);
    (0, react_1.useEffect)(() => __awaiter(this, void 0, void 0, function* () {
        const editorSocket = new editorSocketAPI_1.default();
        yield store_1.default.dispatch((0, commandSlice_1.fetchBoardConfig)());
        editorSocket.init();
        setWebSocket(editorSocket);
    }), []);
    return (react_1.default.createElement(exports.WebSocketContext.Provider, { value: webSocket }, children));
}
exports.default = WebSocket;
