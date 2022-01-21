"use strict";
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
/* eslint-disable class-methods-use-this */
const commandSlice_1 = require("../slices/commandSlice");
const store_1 = __importDefault(require("../store"));
class EditorSocketAPI {
    constructor() {
        this.ws = null;
        this.url = `ws://${window.location.host}`;
    }
    // async fetch() {
    //   await store.dispatch(fetchBoardConfig());
    // }
    init() {
        this.ws = new WebSocket(this.url);
        if (this.ws.readyState !== WebSocket.CONNECTING) {
            setTimeout(() => {
                this.init();
            }, 3000);
            return;
        }
        this.ws.onopen = () => __awaiter(this, void 0, void 0, function* () {
            console.log("Websocket for Editor Connected");
            this.sendDataToServer([
                "boardInfo",
                {
                    type: "editor",
                    name: location.hostname, // get hostname or something else
                },
            ]);
            this.ws.onerror = (err) => {
                console.log(`Editor's Websocket error : ${err.message} `);
            };
            this.ws.onmessage = (msg) => {
                const data = JSON.parse(msg.data);
                console.log(`Data from server :`, data);
                this.handleMessage(data);
            };
            this.ws.onclose = (e) => {
                console.log(`Websocket for Editor closed`);
            };
        });
    }
    sendDataToServer(data) {
        this.ws.send(JSON.stringify(data));
    }
    handleMessage(data) {
        const [task, payload] = data;
        switch (task) {
            case "getIp": {
                const { dancerClients } = payload;
                console.log(dancerClients);
                Object.keys(dancerClients).forEach((dancerName) => {
                    store_1.default.dispatch((0, commandSlice_1.updateDancerStatus)({
                        dancerName,
                        newStatus: {
                            OK: true,
                            isConnected: true,
                            msg: "Connect Success",
                            ip: dancerClients[dancerName].clientIp,
                        },
                    }));
                });
                break;
            }
            case "disconnect": {
                const { from, response: { OK, msg }, } = payload;
                store_1.default.dispatch((0, commandSlice_1.updateDancerStatus)({
                    dancerName: from,
                    newStatus: {
                        OK,
                        msg,
                        isConnected: false,
                    },
                }));
                break;
            }
            // case "play": {
            //   const {
            //     from,
            //     response: { OK, msg },
            //   } = payload;
            //   if (from === location.hostname) {
            //     const { sysTime } = msg;
            //     const realDelay = Math.max(sysTime - Date.now(), 0);
            //     console.log(`play control editor, ${sysTime}, delay:${realDelay}`);
            //     // store.dispatch(startPlay(msg));
            //     setTimeout(() => this.waveSurferApp.playPause(), realDelay);
            //   } else {
            //     store.dispatch(
            //       updateDancerStatus({
            //         dancerName: from,
            //         newStatus: {
            //           OK,
            //           msg,
            //         },
            //       })
            //     );
            //   }
            //   break;
            // }
            // case "pause": {
            //   const {
            //     from,
            //     response: { OK, msg },
            //   } = payload;
            //   if (from === location.hostname) {
            //     console.log("pause control editor");
            //     // store.dispatch(setPlay(false));
            //   } else {
            //     store.dispatch(
            //       updateDancerStatus({
            //         dancerName: from,
            //         newStatus: {
            //           OK,
            //           msg,
            //         },
            //       })
            //     );
            //   }
            //   break;
            // }
            // case "stop": {
            //   const {
            //     from,
            //     response: { OK, msg },
            //   } = payload;
            //   if (from === location.hostname) {
            //     console.log("stop control editor");
            //     // store.dispatch(setStop(true));
            //     this.waveSurferApp.stop();
            //   } else {
            //     store.dispatch(
            //       updateDancerStatus({
            //         dancerName: from,
            //         newStatus: {
            //           OK,
            //           msg,
            //         },
            //       })
            //     );
            //   }
            //   break;
            // }
            default:
                const { from, response: { OK, msg }, } = payload;
                store_1.default.dispatch((0, commandSlice_1.updateDancerStatus)({
                    dancerName: from,
                    newStatus: {
                        OK,
                        msg,
                    },
                }));
                break;
        }
    }
}
exports.default = EditorSocketAPI;
