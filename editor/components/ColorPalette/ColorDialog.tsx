import { useState, ChangeEventHandler } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

import { HexColorPicker } from "react-colorful";

const ColorDialog = ({
  type,
  open,
  handleClose,
  handleMutateColor,
}: {
  type: "add" | "edit";
  open: boolean;
  handleClose: () => void;
  handleMutateColor: (colorName: string, colorCode: string) => void;
}) => {
  const [newColorName, setNewColorName] = useState<string>("");
  const [newColorCode, setNewColorCode] = useState<string>("#FFFFFF");

  const handleInputChange: (
    setState: (value: string) => void
  ) => ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =
    (setState) => (e) => {
      setState(e.target.value);
    };

  const handleSubmit = () => {
    handleMutateColor(newColorName, newColorCode);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{type === "add" ? "New Color" : "Edit Color"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          variant="standard"
          label="Color Name"
          value={newColorName}
          onChange={handleInputChange(setNewColorName)}
        />
        <TextField
          autoFocus
          margin="dense"
          variant="standard"
          label="Color Code"
          value={newColorCode}
          onChange={handleInputChange(setNewColorCode)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit}>Confirm</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColorDialog;
