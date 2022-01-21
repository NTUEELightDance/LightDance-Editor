"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
// import * as CONSTANT from "../../constants";
const COMMANDS = require("../../../constant");
exports.default = Object.values(COMMANDS).reduce((acc, command) => {
    let callback = null;
    switch (command) {
        case COMMANDS.PLAY:
            callback = ({ startTime, delay, sysTime, selectedDancers }) => {
                axios_1.default.post(`/api/${command}`, {
                    args: { startTime, delay, sysTime },
                    selectedDancers,
                });
            };
            break;
        case COMMANDS.UPLOAD_CONTROL:
            callback = ({ controlJson, selectedDancers }) => {
                axios_1.default.post(`/api/${command}`, {
                    args: { controlJson },
                    selectedDancers,
                });
            };
            break;
        case COMMANDS.UPLOAD_LED:
            callback = ({ selectedDancers }) => {
                axios_1.default.post(`/api/${command}`, { args: {}, selectedDancers });
            };
            break;
        case COMMANDS.LIGTHCURRENTSTATUS:
            callback = ({ lightCurrentStatus, selectedDancers }) => {
                axios_1.default.post(`/api/${command}`, {
                    args: { lightCurrentStatus },
                    selectedDancers,
                });
            };
            break;
        default:
            callback = ({ selectedDancers }) => {
                axios_1.default.post(`/api/${command}`, { args: {}, selectedDancers });
            };
            break;
    }
    return Object.assign(Object.assign({}, acc), { [command]: callback });
}, {});
