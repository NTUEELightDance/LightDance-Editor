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
const root_1 = require("react-hot-loader/root");
const react_1 = __importStar(require("react"));
// mui
const styles_1 = require("@material-ui/core/styles");
const CssBaseline_1 = __importDefault(require("@material-ui/core/CssBaseline"));
// redux
const react_redux_1 = require("react-redux");
// actions
const loadSlice_1 = require("./slices/loadSlice");
// layout
const layout_1 = __importDefault(require("./layout"));
require("./app.css");
// components
const bar_1 = __importDefault(require("./components/bar"));
const theme = (0, styles_1.createMuiTheme)({
    palette: {
        type: "dark",
        primary: {
            main: "#94BBFF",
            dark: "#94BBFF",
        },
        background: {
            paper: "#292929",
            default: "#121212",
        },
    },
    typography: {
        // In Chinese and Japanese the characters are usually larger,
        // so a smaller fontsize may be appropriate.
        fontSize: 12,
    },
});
/**
 * Component for the main
 * @component
 */
const App = () => {
    const { init } = (0, react_redux_1.useSelector)(loadSlice_1.selectLoad);
    const dispatch = (0, react_redux_1.useDispatch)();
    (0, react_1.useEffect)(() => __awaiter(void 0, void 0, void 0, function* () {
        if (!init) {
            yield dispatch((0, loadSlice_1.fetchLoad)());
        }
    }), [init]);
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(styles_1.ThemeProvider, { theme: theme },
            react_1.default.createElement(CssBaseline_1.default, null),
            init ? (react_1.default.createElement("div", { style: {
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                } },
                react_1.default.createElement(bar_1.default, null),
                react_1.default.createElement("div", { style: { flexGrow: 1, position: "relative" } },
                    react_1.default.createElement(layout_1.default, null)))) : ("Loading..."))));
};
exports.default = (0, root_1.hot)(App);
