"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const toolkit_1 = require("@reduxjs/toolkit");
const globalSlice_1 = __importDefault(require("../slices/globalSlice"));
const loadSlice_1 = __importDefault(require("../slices/loadSlice"));
const commandSlice_1 = __importDefault(require("../slices/commandSlice"));
exports.default = (0, toolkit_1.configureStore)({
    reducer: {
        global: globalSlice_1.default,
        load: loadSlice_1.default,
        command: commandSlice_1.default,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
        // }).concat(logger),
    }),
});
