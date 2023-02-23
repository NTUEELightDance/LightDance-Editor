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

export interface LEDEffectDialogProps {
  addDialogOpen: boolean;
  handleClose: () => void;
}

export default function LEFDffectDialog({
  addDialogOpen,
  handleClose,
}: LEDEffectDialogProps) {
  return (
    <div>
      <Dialog open={addDialogOpen} onClose={handleClose}>
        <p>{`${addDialogOpen}`}</p>
      </Dialog>
    </div>
  );
}
