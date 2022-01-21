"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItem = exports.setItem = void 0;
const storage = window.localStorage;
exports.default = storage;
function setItem(key, value) {
    storage.setItem(key, value);
}
exports.setItem = setItem;
function getItem(key) {
    return storage.getItem(key);
}
exports.getItem = getItem;
