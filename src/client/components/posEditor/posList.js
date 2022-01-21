"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_redux_1 = require("react-redux");
// mui
const List_1 = __importDefault(require("@material-ui/core/List"));
const ListItem_1 = __importDefault(require("@material-ui/core/ListItem"));
const Typography_1 = __importDefault(require("@material-ui/core/Typography"));
// redux selector and actions
const globalSlice_1 = require("../../slices/globalSlice");
// components
// constants
const constants_1 = require("../../constants");
function PosList() {
    const { timeData: { posFrame }, posRecord, } = (0, react_redux_1.useSelector)(globalSlice_1.selectGlobal);
    const dispatch = (0, react_redux_1.useDispatch)();
    // select item, change posFrame
    const handleSelectItem = (idx) => {
        dispatch((0, globalSlice_1.setPosFrame)({ from: constants_1.POSEDITOR, posFrame: idx }));
    };
    return (react_1.default.createElement(List_1.default, { component: "nav" }, posRecord.map((pos, idx) => (react_1.default.createElement(ListItem_1.default
    // eslint-disable-next-line react/no-array-index-key
    , { 
        // eslint-disable-next-line react/no-array-index-key
        key: `posItem_${idx}`, selected: posFrame === idx, button: true, onClick: () => handleSelectItem(idx) },
        react_1.default.createElement(Typography_1.default, { variant: "body1", color: "initial" },
            "[",
            idx,
            "] time: ",
            pos.start))))));
}
exports.default = PosList;
