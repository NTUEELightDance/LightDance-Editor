import React, { useState, useRef } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";

import { HexColorPicker } from "react-colorful";
import { notification } from "core/utils";
import { Color, ColorCode, isColorCode } from "@/core/models";

export interface NewColorDialogProps {
  variant: "add";
  open: boolean;
  color?: never;
  handleClose: () => void;
  handleMutateColor: (
    color: Pick<Color, "name" | "colorCode">
  ) => Promise<void>;
}

export interface EditColorDialogProps {
  variant: "edit";
  open: boolean;
  color: Color;
  handleClose: () => void;
  handleMutateColor: (
    color: Pick<Color, "id" | "name" | "colorCode">
  ) => Promise<void>;
}

function ColorDialog({
  variant,
  open,
  color,
  handleClose,
  handleMutateColor,
}: NewColorDialogProps | EditColorDialogProps) {
  const [newColorName, setNewColorName] = useState<string>(color?.name || "");
  const [newColorCode, setNewColorCode] = useState<ColorCode>(
    color?.colorCode || ("#FFFFFF" as ColorCode)
  );

  const handleNameChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    setNewColorName(e.target.value);
    colorNameError && setColorNameError(false);
  };

  const handleColorChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    if (!isColorCode(e.target.value)) return;
    setNewColorCode(e.target.value);
  };

  const handleColorInputChange = (colorCode: string) => {
    if (!isColorCode(colorCode)) return;
    setNewColorCode(colorCode);
  };

  const [colorNameError, setColorNameError] = useState(false);
  const handleSubmit = async () => {
    try {
      if (variant === "add") {
        await handleMutateColor({
          name: newColorName,
          colorCode: newColorCode,
        });
      } else {
        await handleMutateColor({
          id: color.id,
          name: newColorName,
          colorCode: newColorCode,
        });
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
        {variant === "add" ? "New Color" : "Edit Color"}
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
          <TextField
            margin="dense"
            label="Color Code"
            variant="filled"
            value={newColorCode}
            onChange={handleColorChange}
            inputRef={colorInputRef}
            onKeyDown={handleColorEnter}
          />
          <Box sx={{ mt: "1.5em" }}>
            <HexColorPicker
              color={newColorCode}
              onChange={handleColorInputChange}
            />
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
