import React, { useState, useEffect, useRef } from "react";

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
import { notification } from "core/utils";

function ColorDialog({
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
  handleMutateColor: (colorName: string, colorCode: string) => Promise<void>;
  defaultColorName?: string;
  defaultColorCode?: string;
  disableNameChange?: boolean;
}) {
  const [newColorName, setNewColorName] = useState<string>(
    defaultColorName || ""
  );
  const [newColorCode, setNewColorCode] = useState<string>(
    defaultColorCode || "#FFFFFF"
  );

  useEffect(() => {
    if (!defaultColorName) setNewColorName("");
    if (!defaultColorCode) setNewColorCode("#FFFFFF");
  }, [defaultColorName, defaultColorCode, open]);

  const handleNameChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    setNewColorName(e.target.value);
    colorNameError && setColorNameError(false);
  };

  const handleColorChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    setNewColorCode(e.target.value);
  };

  const [colorNameError, setColorNameError] = useState(false);
  const handleSubmit = async () => {
    try {
      await handleMutateColor(newColorName, newColorCode);
      handleClose();
    } catch (error) {
      notification.error((error as Error).message);
      console.error(error);
      setColorNameError(true);
    }
  };

  // for auto navigation on Enter
  const colorInputRef = useRef<HTMLInputElement>();
  const handleNameEnter: React.KeyboardEventHandler = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      colorInputRef?.current != null && colorInputRef.current.focus();
    }
  };
  const handleColorEnter: React.KeyboardEventHandler = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={!!open} onClose={handleClose}>
      <DialogTitle>{type === "add" ? "New Color" : "Edit Color"}</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1em",
            alignItems: "center",
          }}
        >
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
              error={colorNameError}
              onChange={handleNameChange}
              disabled={disableNameChange}
              onKeyDown={handleNameEnter}
            />
          )}
          <TextField
            margin="dense"
            label="Color Code"
            variant="filled"
            value={newColorCode}
            onChange={handleColorChange}
            inputRef={colorInputRef as React.RefObject<HTMLInputElement>}
            onKeyDown={handleColorEnter}
          />
          <Box sx={{ mt: "1.5em" }}>
            <HexColorPicker color={newColorCode} onChange={setNewColorCode} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ColorDialog;
