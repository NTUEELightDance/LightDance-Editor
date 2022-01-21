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
const PIXI = __importStar(require("pixi.js"));
// utils
const localStorage_1 = require("../../utils/localStorage");
// redux actions and store
const globalSlice_1 = require("../../slices/globalSlice");
const store_1 = __importDefault(require("../../store"));
// components
const dancer_1 = __importDefault(require("./dancer"));
/**
 * Control the dancers (or other light objects)'s status and pos
 * @constructor
 */
class Controller {
    constructor() {
        this.dancers = {};
        this.pixiApp = null;
        this.mainContainer = null;
    }
    /**
     * Initiate localStorage, waveSurferApp, PixiApp, dancers
     */
    init() {
        // initialization by localStorage
        if (!(0, localStorage_1.getItem)("control")) {
            (0, localStorage_1.setItem)("control", JSON.stringify(store_1.default.getState().load.control));
        }
        if (!(0, localStorage_1.getItem)("controlMap")) {
            (0, localStorage_1.setItem)("controlMap", JSON.stringify(store_1.default.getState().load.controlMap));
        }
        if (!(0, localStorage_1.getItem)("position")) {
            (0, localStorage_1.setItem)("position", JSON.stringify(store_1.default.getState().load.position));
        }
        store_1.default.dispatch((0, globalSlice_1.controlInit)({
            controlRecord: JSON.parse((0, localStorage_1.getItem)("control")),
            controlMap: JSON.parse((0, localStorage_1.getItem)("controlMap")),
        }));
        store_1.default.dispatch((0, globalSlice_1.posInit)(JSON.parse((0, localStorage_1.getItem)("position"))));
        // initialization for PIXIApp
        this.pixiApp = new PIXI.Application({
            resizeTo: document.getElementById("pixi"),
            backgroundColor: 0x000000,
        });
        this.mainContainer = new PIXI.Container();
        this.mainContainer.sortableChildren = true;
        this.pixiApp.stage.addChild(this.mainContainer);
        document.getElementById("main_stage").appendChild(this.pixiApp.view);
        // initialization for dancers
        const { dancerNames } = store_1.default.getState().load;
        dancerNames.forEach((name, idx) => {
            this.dancers[name] = new dancer_1.default(idx, name, this.pixiApp, store_1.default.getState().load.texture, this.mainContainer);
        });
    }
    /**
     * update DancersStatus
     * @param {object} currentStatus - all dancers' status
     * ex. { dancer0: { HAT1: 0, ... }}
     */
    updateDancersStatus(currentStatus) {
        if (Object.entries(currentStatus).length === 0)
            throw new Error(`[Error] updateDancersStatus, invalid parameter(currentStatus)`);
        Object.entries(currentStatus).forEach(([key, value]) => {
            this.dancers[key].setStatus(value);
        });
    }
    /**
     * updateDancersPos
     * @param {*} currentPos
     * ex. { dancer0: { "x": 49.232, "y": 0, "z": 0 }}
     */
    updateDancersPos(currentPos) {
        if (Object.entries(currentPos).length === 0)
            throw new Error(`[Error] updateDancersPos, invalid parameter(currentPos)`);
        Object.entries(currentPos).forEach(([key, value]) => {
            this.dancers[key].setPos(value);
        });
    }
}
exports.default = Controller;
