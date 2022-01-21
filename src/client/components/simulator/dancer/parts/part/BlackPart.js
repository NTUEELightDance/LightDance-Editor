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
const Part_1 = __importDefault(require("./Part"));
class BlackPart extends Part_1.default {
    constructor(dancer, name, settings, textures) {
        super(dancer, name, settings);
        // only one texture.name, and it's a string
        this.textures[textures.name] = PIXI.Texture.from(`${textures.prefix}${textures.name}${textures.postfix}`);
        this.sprite.texture = this.textures[textures.name];
    }
    updateTexture(args) {
        // console.log("Error: Black Part shouldn't be updateTexture!!!", args);
    }
}
exports.default = BlackPart;
