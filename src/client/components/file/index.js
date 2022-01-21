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
const react_1 = __importStar(require("react"));
const react_redux_1 = require("react-redux");
// mui
const styles_1 = require("@material-ui/styles");
const Button_1 = __importDefault(require("@material-ui/core/Button"));
const TextField_1 = __importDefault(require("@material-ui/core/TextField"));
const Typography_1 = __importDefault(require("@material-ui/core/Typography"));
const Container_1 = __importDefault(require("@material-ui/core/Container"));
const Divider_1 = __importDefault(require("@material-ui/core/Divider"));
const Switch_1 = __importDefault(require("@material-ui/core/Switch"));
const MenuItem_1 = __importDefault(require("@material-ui/core/MenuItem"));
const FormControlLabel_1 = __importDefault(require("@material-ui/core/FormControlLabel"));
// write record
const globalSlice_1 = require("../../slices/globalSlice");
// select
const loadSlice_1 = require("../../slices/loadSlice");
// utils
const localStorage_1 = require("../../utils/localStorage");
// api
const api_1 = require("../../api");
// utils
const utils_1 = require("./utils");
const useStyles = (0, styles_1.makeStyles)({});
/**
 * Upload and download files
 * upload:
 * control.json -> need to ask update serverSide or not (Don't need to do this for testing)
 * position.json -> need to ask update serverSide or not (Don't need to do this for testing)
 * texture: [name].png -> update texture.json
 * download:
 * pack.tar.gz
 * |- asset/
 *      |- BlackPart
 *      |- LED
 *      |- Part
 * |- control.json
 * |- position.json
 * |- texture.json
 */
function File() {
    const classes = useStyles();
    // upload to server
    const dispatch = (0, react_redux_1.useDispatch)();
    const { texture } = (0, react_redux_1.useSelector)(loadSlice_1.selectLoad);
    const { posRecord, controlRecord, controlMap } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    const [toServer, setToServer] = (0, react_1.useState)(false);
    const [controlRecordFile, setControlRecordFile] = (0, react_1.useState)(null);
    const [controlMapFile, setControlMap] = (0, react_1.useState)(null);
    const [posRecordFile, setPosRecordFile] = (0, react_1.useState)(null);
    const [selectedImages, setSelectedImages] = (0, react_1.useState)(null);
    const [path, setPath] = (0, react_1.useState)("");
    const imagePrefix = Object.values(texture.LEDPARTS)[0].prefix;
    const handlePosInput = (e) => {
        // checkPosJson(e.target.files);
        setPosRecordFile(e.target.files);
    };
    const handleControlInput = (e) => {
        setControlRecordFile(e.target.files);
    };
    const handleControlMapInput = (e) => {
        setControlMap(e.target.files);
    };
    const handleImagesInput = (e) => {
        setSelectedImages(e.target.files);
    };
    const handlePathChange = (e) => {
        setPath(e.target.value);
    };
    const handleControlUpload = () => __awaiter(this, void 0, void 0, function* () {
        if (!controlRecordFile || !controlMapFile) {
            alert("Both controlRecord and controlMap files are required");
            return;
        }
        const controlRecord = yield (0, utils_1.uploadJson)(controlRecordFile);
        const controlMap = yield (0, utils_1.uploadJson)(controlMapFile);
        //Todo: check controlMap and controlRecord are matched
        const { checkPass, errorMessage } = (0, utils_1.checkControlJson)(controlRecord, controlMap);
        if (checkPass) {
            if (window.confirm("Check Pass! Are you sure to upload new Control file ?")) {
                (0, localStorage_1.setItem)("control", JSON.stringify(controlRecord));
                (0, localStorage_1.setItem)("controlMap", JSON.stringify(controlMap));
                dispatch((0, globalSlice_1.controlInit)({ controlRecord, controlMap }));
            }
        }
        else
            alert(errorMessage);
    });
    const handlePosUpload = () => __awaiter(this, void 0, void 0, function* () {
        if (posRecordFile) {
            const position = yield (0, utils_1.uploadJson)(posRecordFile);
            if ((0, utils_1.checkPosJson)(position)) {
                if (window.confirm("Check Pass! Are you sure to upload new Position file?"))
                    (0, localStorage_1.setItem)("position", JSON.stringify(position));
                dispatch((0, globalSlice_1.posInit)(position));
            }
            else
                alert("Pos: Wrong JSON format");
            // setPosRecordFile(undefined);
        }
    });
    const handleImagesUpload = () => __awaiter(this, void 0, void 0, function* () {
        if (selectedImages && path) {
            (0, api_1.uploadImages)(selectedImages, path, imagePrefix);
            // setSelectedImages(undefined);
            // setPath("");
        }
    });
    const handleDownloadControl = () => {
        (0, utils_1.downloadControlJson)(controlRecord, controlMap);
    };
    const handleDownloadPos = () => {
        (0, utils_1.downloadPos)(posRecord);
    };
    const handleDownloadEverything = () => {
        (0, utils_1.downloadEverything)(controlRecord, controlMap, posRecord);
    };
    const handleSwitchServer = () => setToServer(!toServer);
    // TODO: make upload and download functional
    return (react_1.default.createElement(Container_1.default, null,
        react_1.default.createElement("div", null,
            react_1.default.createElement(FormControlLabel_1.default, { control: react_1.default.createElement(Switch_1.default, { checked: toServer, onChange: handleSwitchServer, name: "switchServer" }), label: "Upload to Server (Don't open this when testing)" }),
            react_1.default.createElement("div", null,
                react_1.default.createElement(Typography_1.default, { variant: "h6", color: "initial" }, "Upload control.json"),
                react_1.default.createElement("div", { style: { display: "flex", alignItems: "normal" } },
                    react_1.default.createElement("label", { htmlFor: "control" }, "controlRecord: "),
                    react_1.default.createElement("input", { id: "control", name: "control", type: "file", accept: ".json", onChange: handleControlInput })),
                react_1.default.createElement("div", { style: { display: "flex", alignItems: "normal" } },
                    react_1.default.createElement("label", { htmlFor: "controlMap" }, "controlMap: "),
                    react_1.default.createElement("input", { id: "controlMap", name: "controlMap", type: "file", accept: ".json", onChange: handleControlMapInput }),
                    react_1.default.createElement(Button_1.default, { variant: "outlined", color: "default", onClick: () => {
                            handleControlUpload();
                        } }, "Upload"),
                    react_1.default.createElement(Button_1.default, { variant: "outlined", color: "default", onClick: () => {
                            handleDownloadControl();
                        } }, "Download"))),
            react_1.default.createElement("div", null,
                react_1.default.createElement(Typography_1.default, { variant: "h6", color: "initial" }, "Upload position.json"),
                react_1.default.createElement("div", { style: { display: "flex", alignItems: "normal" } },
                    react_1.default.createElement("input", { id: "position", name: "position", type: "file", accept: ".json", onChange: handlePosInput }),
                    react_1.default.createElement(Button_1.default, { variant: "outlined", color: "default", onClick: () => {
                            handlePosUpload();
                        } }, "Upload"),
                    react_1.default.createElement(Button_1.default, { variant: "outlined", color: "default", onClick: () => {
                            handleDownloadPos();
                        } }, "Download")))),
        react_1.default.createElement("div", null,
            react_1.default.createElement(Typography_1.default, { variant: "h6", color: "initial" },
                "Upload [name].png ",
                react_1.default.createElement("strong", null, "(should select part)")),
            react_1.default.createElement("div", { style: { display: "flex", alignItems: "normal" } },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("input", { id: "images", name: "images", type: "file", accept: "image/*", multiple: true, onChange: handleImagesInput })),
                react_1.default.createElement(TextField_1.default, { select: true, value: path, variant: "outlined", onChange: handlePathChange, size: "small" }, Object.keys(texture.LEDPARTS).map((name) => (react_1.default.createElement(MenuItem_1.default, { key: name, value: name }, name)))),
                react_1.default.createElement(Button_1.default, { variant: "outlined", color: "default", onClick: () => {
                        handleImagesUpload();
                    } }, "Upload"))),
        react_1.default.createElement("br", null),
        react_1.default.createElement(Divider_1.default, null),
        react_1.default.createElement("br", null),
        react_1.default.createElement(Button_1.default, { variant: "outlined", color: "default", onClick: () => {
                handleDownloadEverything();
            } }, "Download")));
}
exports.default = File;
