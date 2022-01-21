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
const react_1 = __importStar(require("react"));
// mui
const Button_1 = __importDefault(require("@material-ui/core/Button"));
const Menu_1 = __importDefault(require("@material-ui/core/Menu"));
const MenuItem_1 = __importDefault(require("@material-ui/core/MenuItem"));
// components
const timeShift_1 = __importDefault(require("./timeShift"));
function Tools() {
    // open or close menu
    const [anchorEl, setAnchorEl] = react_1.default.useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    // open timeShift
    const [openTimeShift, setOpenTimeShift] = (0, react_1.useState)(false);
    const handleOpenTimeShift = () => {
        setOpenTimeShift(true);
        handleClose();
    };
    const handleCloseTimeShift = () => {
        setOpenTimeShift(false);
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(Button_1.default, { "aria-haspopup": "true", onClick: handleClick }, "Tools"),
        react_1.default.createElement(Menu_1.default, { anchorEl: anchorEl, keepMounted: true, open: Boolean(anchorEl), onClose: handleClose },
            react_1.default.createElement(MenuItem_1.default, { onClick: handleOpenTimeShift }, "TimeShift"),
            react_1.default.createElement(MenuItem_1.default, { onClick: handleClose }, "Merge")),
        react_1.default.createElement(timeShift_1.default, { open: openTimeShift, handleClose: handleCloseTimeShift })));
}
exports.default = Tools;
