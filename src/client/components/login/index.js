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
const Dialog_1 = __importDefault(require("@material-ui/core/Dialog"));
const Button_1 = __importDefault(require("@material-ui/core/Button"));
const TextField_1 = __importDefault(require("@material-ui/core/TextField"));
const DialogActions_1 = __importDefault(require("@material-ui/core/DialogActions"));
const DialogContent_1 = __importDefault(require("@material-ui/core/DialogContent"));
const DialogTitle_1 = __importDefault(require("@material-ui/core/DialogTitle"));
const react_redux_1 = require("react-redux");
const api_1 = require("../../api");
const globalSlice_1 = require("../../slices/globalSlice");
function Login() {
    const [user, setUser] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [open, setOpen] = (0, react_1.useState)(false);
    const { username } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    const handleClose = () => {
        setOpen(false);
    };
    const handleOpen = () => {
        setOpen(true);
    };
    const handleLogin = () => {
        console.log("login");
        (0, api_1.loginPost)(user, password);
        setOpen(false);
    };
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(Button_1.default, { onClick: handleOpen, size: "small", variant: "text", color: "default" }, username || "LOGIN"),
        react_1.default.createElement(Dialog_1.default, { open: open, onClose: handleClose },
            react_1.default.createElement(DialogTitle_1.default, { id: "max-width-dialog-title" }, "Login"),
            react_1.default.createElement(DialogContent_1.default, null,
                react_1.default.createElement(TextField_1.default, { autoFocus: true, margin: "dense", id: "name", label: "username", type: "email", fullWidth: true, onChange: (e) => setUser(e.target.value), value: user }),
                react_1.default.createElement(TextField_1.default, { margin: "dense", id: "name", label: "password", type: "password", fullWidth: true, onChange: (e) => setPassword(e.target.value), value: password })),
            react_1.default.createElement(DialogActions_1.default, null,
                react_1.default.createElement(Button_1.default, { onClick: handleLogin, color: "primary" }, "LOGIN")))));
}
exports.default = Login;
