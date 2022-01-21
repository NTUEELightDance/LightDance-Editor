"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandAgent = exports.fetchTexture = exports.requestDownload = exports.uploadImages = exports.uploadJson = exports.deleteBranch = exports.createBranch = exports.getBranches = exports.loginPost = exports.syncPost = void 0;
const globalSlice_1 = require("./slices/globalSlice");
const store_1 = __importDefault(require("./store"));
const syncPost = (branchName, from, type, mode, data) => {
    const payload = JSON.stringify({ branchName, from, type, mode, data });
    return fetch("/api/editor/sync", {
        method: "POST",
        body: payload,
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.text())
        .then((result) => console.log(JSON.parse(JSON.parse(result).data)))
        .catch((error) => console.log("error", error));
};
exports.syncPost = syncPost;
const loginPost = (username, password) => {
    const payload = JSON.stringify({ username, password });
    return fetch("/api/editor/login", {
        method: "POST",
        body: payload,
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.text())
        .then((result) => {
        const data = JSON.parse(result);
        if (data.username) {
            store_1.default.dispatch((0, globalSlice_1.login)(data));
        }
    })
        .catch((error) => console.log("error", error));
};
exports.loginPost = loginPost;
const getBranches = () => {
    return fetch("/api/editor/branch", {
        method: "GET",
    })
        .then((response) => response.text())
        .then((result) => console.log(JSON.parse(result).branches))
        .catch((error) => console.log("error", error));
};
exports.getBranches = getBranches;
const createBranch = (branchName) => {
    const payload = JSON.stringify({ branchName });
    return fetch("/api/editor/branch", {
        method: "POST",
        body: payload,
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.text())
        .then((result) => console.log(JSON.parse(result).data))
        .catch((error) => console.log("error", error));
};
exports.createBranch = createBranch;
const deleteBranch = (branchName) => {
    const payload = JSON.stringify({ branchName });
    return fetch("/api/editor/branch", {
        method: "DELETE",
        body: payload,
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.text())
        .then((result) => console.log(JSON.parse(result).data))
        .catch((error) => console.log("error", error));
};
exports.deleteBranch = deleteBranch;
const uploadJson = (file, type) => {
    const formData = new FormData();
    formData.append(type, file);
    if (type === "position" && type === "control") {
        fetch(`/api/editor/upload/${type}`, {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
            console.log(data);
        })
            .catch((error) => {
            console.error(error);
        });
    }
};
exports.uploadJson = uploadJson;
const uploadImages = (files, path, imagePrefix) => {
    const formData = new FormData();
    files.forEach((file, i) => {
        formData.append(`image${i}`, file);
    });
    formData.append("filePath", path);
    formData.append("imagePrefix", imagePrefix);
    fetch("/api/editor/upload/images", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
        console.log(data);
    })
        .catch((error) => {
        console.error(error);
    });
};
exports.uploadImages = uploadImages;
const requestDownload = (control, position, texture) => {
    const payload = JSON.stringify({ control, position, texture });
    fetch("/api/editor/download", {
        method: "POST",
        body: payload,
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.text())
        .then((data) => {
        console.log(data);
    })
        .catch((error) => {
        console.error(error);
    });
};
exports.requestDownload = requestDownload;
const fetchTexture = () => {
    const texturePath = store_1.default.getState().load.load.Texture;
    return fetch(texturePath, {
        method: "GET",
    })
        .then((response) => response.json())
        .catch((error) => {
        console.error(error);
    });
};
exports.fetchTexture = fetchTexture;
const CommandAgent = () => { };
exports.CommandAgent = CommandAgent;
