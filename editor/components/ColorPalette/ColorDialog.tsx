import React, { useState, useEffect, ChangeEventHandler, useRef } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Tooltip,
} from "@mui/material";

import { HexColorPicker } from "react-colorful";

const ColorDialog = ({
  type,
  open,
  handleClose,
  handleMutateColor,
  defaultColorName,
  defaultColorCode,
  disableNameChange,
}: {
  type: "add" | "edit";
  open: boolean;
  handleClose: () => void;
  handleMutateColor: (colorName: string, colorCode: string) => void;
  defaultColorName?: string;
  defaultColorCode?: string;
  disableNameChange?: boolean;
}) => {
  const [newColorName, setNewColorName] = useState<string>(
    defaultColorName ? defaultColorName : ""
  );
  const [newColorCode, setNewColorCode] = useState<string>(
    defaultColorCode ? defaultColorCode : "#FFFFFF"
  );

  useEffect(() => {
    if (!defaultColorName) setNewColorName("");
    if (!defaultColorCode) setNewColorCode("#FFFFFF");
  }, [open]);

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

  // for auto navigation on Enter
  const colorInputRef = useRef<HTMLInputElement>();
  const handleNameEnter: React.KeyboardEventHandler = (e) => {
    console.log(e.key);
    if (e.key === "Enter") {
      console.log(colorInputRef.current);
      e.preventDefault();
      colorInputRef?.current && colorInputRef.current.focus();
    }
  };
  const handleColorEnter: React.KeyboardEventHandler = (e) => {
    console.log(e.key);
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={!!open} onClose={handleClose}>
      <DialogTitle>{type === "add" ? "New Color" : "Edit Color"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "1em" }}>
          {disableNameChange ? (
            <Tooltip title="this is a reserved color">
              <TextField
                margin="dense"
                label="Color Name"
                variant="filled"
                value={newColorName}
                disabled
              />
            </Tooltip>
          ) : (
            <TextField
              autoFocus
              margin="dense"
              label="Color Name"
              variant="filled"
              value={newColorName}
              onChange={handleInputChange(setNewColorName)}
              disabled={disableNameChange}
              onKeyDown={handleNameEnter}
            />
          )}
          <TextField
            margin="dense"
            label="Color Code"
            variant="filled"
            value={newColorCode}
            onChange={handleInputChange(setNewColorCode)}
            inputRef={colorInputRef as React.RefObject<HTMLInputElement>}
            onKeyDown={handleColorEnter}
          />
          <HexColorPicker color={newColorCode} onChange={setNewColorCode} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColorDialog;
