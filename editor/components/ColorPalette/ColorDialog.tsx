import React, { useState, useEffect, useRef } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";

import { HexColorPicker } from "react-colorful";
import { notification } from "core/utils";

export interface AddColorDialogProps {
  variant: "add";
  open: boolean;
  handleClose: () => void;
  handleUpdateColor: (colorName: string, colorCode: string) => Promise<void>;
  colorName?: never;
  currentColorCode?: never;
}

export interface EditColorDialogProps {
  variant: "edit";
  open: boolean;
  handleClose: () => void;
  handleUpdateColor: (colorCode: string) => Promise<void>;
  colorName: string;
  currentColorCode: string;
}

export type ColorDialogProps = AddColorDialogProps | EditColorDialogProps;

function ColorDialog({
  variant,
  open,
  handleClose,
  handleUpdateColor,
  colorName,
  currentColorCode,
}: ColorDialogProps) {
  const [newColorName, setNewColorName] = useState<string>("");
  const [newColorCode, setNewColorCode] = useState<string>(
    currentColorCode ?? "#FFFFFF"
  );

  useEffect(() => {
    if (!colorName) setNewColorName("");
    if (!currentColorCode) setNewColorCode("#FFFFFF");
  }, [colorName, currentColorCode, open]);

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
      if (variant === "add") {
        if (!newColorName) {
          setColorNameError(true);
          return;
        }
        await handleUpdateColor(newColorName, newColorCode);
      } else {
        await handleUpdateColor(newColorCode);
      }
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
      <DialogTitle>
        {variant === "add" ? (
          <Typography>New Color</Typography>
        ) : (
          <Typography>
            {"Editing Color: "}
            <Typography component="span" variant="h6">
              {colorName}
            </Typography>
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1em",
            alignItems: "center",
          }}
        >
          {variant === "add" && (
            <TextField
              autoFocus
              margin="dense"
              label="Color Name"
              variant="filled"
              value={newColorName}
              error={colorNameError}
              onChange={handleNameChange}
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
