import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export const NewColorDialog = ({
  open,
  handleClose,
  handleAddColor,
}: {
  open: boolean;
  handleClose: () => void;
  handleAddColor: (colorName: string, colorCode: string) => void;
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Subscribe</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To subscribe to this website, please enter your email address here. We
          will send updates occasionally.
        </DialogContentText>
        <TextField autoFocus margin="dense" variant="standard" />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Confirm</Button>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
