"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globalSlice_1 = require("../slices/globalSlice");
const store_1 = __importDefault(require("../store"));
class WebSocketAPI {
    constructor() {
        this.ws = null;
        this.url = `ws://${window.location.host}`;
    }
    init() {
        const ws = new WebSocket(this.url);
        // ws.onmessage = (e) => {
        //   console.log(e);
        //   this.multiEditAgent(e);
        // };
        this.ws = ws;
    }
    // eslint-disable-next-line class-methods-use-this
    multiEditAgent(e) {
        const { mode, type } = JSON.parse(e.data);
        if (mode === "EDIT" || mode === "ADD") {
            if (type === "control") {
                store_1.default.dispatch((0, globalSlice_1.syncStatus)(JSON.parse(e.data)));
            }
            if (type === "position") {
                store_1.default.dispatch((0, globalSlice_1.syncPos)(JSON.parse(e.data)));
            }
        }
        if (mode === "DEL") {
            console.log(JSON.parse(e.data));
            store_1.default.dispatch((0, globalSlice_1.syncDelete)(JSON.parse(e.data)));
        }
    }
}
exports.default = WebSocketAPI;
