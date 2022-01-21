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
const prop_types_1 = __importDefault(require("prop-types"));
// mui
const styles_1 = require("@material-ui/styles");
const List_1 = __importDefault(require("@material-ui/core/List"));
const ListItem_1 = __importDefault(require("@material-ui/core/ListItem"));
const Button_1 = __importDefault(require("@material-ui/core/Button"));
const Dialog_1 = __importDefault(require("@material-ui/core/Dialog"));
const DialogTitle_1 = __importDefault(require("@material-ui/core/DialogTitle"));
const DialogContent_1 = __importDefault(require("@material-ui/core/DialogContent"));
const DialogActions_1 = __importDefault(require("@material-ui/core/DialogActions"));
const TextField_1 = __importDefault(require("@material-ui/core/TextField"));
const IconButton_1 = __importDefault(require("@material-ui/core/IconButton"));
const Typography_1 = __importDefault(require("@material-ui/core/Typography"));
const Edit_1 = __importDefault(require("@material-ui/icons/Edit"));
const Delete_1 = __importDefault(require("@material-ui/icons/Delete"));
const useStyles = (0, styles_1.makeStyles)({
    flex: {
        display: "flex",
    },
    grow: {
        flexGrow: 1,
    },
    btn: {
        padding: 0,
    },
});
/**
 * This is Presets List
 * @component
 */
function PresetsList({ presets, handleEditPresets, handleDeletePresets, handleSetCurrent, }) {
    const classes = useStyles();
    // dialog
    const [open, setOpen] = (0, react_1.useState)(false);
    const [nameVal, setNameVal] = (0, react_1.useState)("");
    const [presetId, setPresetId] = (0, react_1.useState)(0);
    const openDialog = (name, id) => {
        setNameVal(name);
        setPresetId(id);
        setOpen(true);
    };
    const closeDialog = () => {
        setOpen(false);
        setNameVal("");
    };
    const handleChangeName = (e) => setNameVal(e.target.value);
    return (react_1.default.createElement("div", null,
        react_1.default.createElement(List_1.default, null,
            presets.map(({ name, status, pos }, i) => (react_1.default.createElement(ListItem_1.default, { key: `${i}_preset`, className: classes.flex, onDoubleClick: () => handleSetCurrent(status || pos) },
                react_1.default.createElement("div", { className: classes.grow },
                    react_1.default.createElement(Typography_1.default, { variant: "body1" },
                        "[",
                        i,
                        "] ",
                        name)),
                react_1.default.createElement("div", null,
                    react_1.default.createElement(IconButton_1.default, { className: classes.btn, onClick: () => openDialog(name, i) },
                        react_1.default.createElement(Edit_1.default, null)),
                    react_1.default.createElement(IconButton_1.default, null,
                        react_1.default.createElement(Delete_1.default, { className: classes.btn, onClick: () => handleDeletePresets(i) })))))),
            react_1.default.createElement(Dialog_1.default, { fullWidth: true, size: "md", open: open, onClose: closeDialog },
                react_1.default.createElement(DialogTitle_1.default, null, "Preset name"),
                react_1.default.createElement(DialogContent_1.default, null,
                    react_1.default.createElement(TextField_1.default, { fullWidth: true, value: nameVal, onChange: handleChangeName })),
                react_1.default.createElement(DialogActions_1.default, null,
                    react_1.default.createElement(Button_1.default, { onClick: () => handleEditPresets(nameVal, presetId) }, "OK"))))));
}
exports.default = PresetsList;
PresetsList.propTypes = {
    presets: prop_types_1.default.array.isRequired,
};
