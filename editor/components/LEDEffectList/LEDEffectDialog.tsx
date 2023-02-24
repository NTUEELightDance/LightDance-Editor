import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Paper,
} from "@mui/material";

export interface LEDEffectDialogProps {
  addDialogOpen: boolean;
  handleClose: () => void;
}

export default function LEFDffectDialog({
  addDialogOpen,
  handleClose,
}: LEDEffectDialogProps) {
  let displayModels = ["a", "b", "c", "d", "e", "f"];
  let displayLEDParts = ["1", "2", "3", "4", "5", "6", "7"];
  return (
    <div>
      <Paper>
        <Dialog open={addDialogOpen} onClose={handleClose}>
          <DialogTitle>New LED Effect</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="New Effect Name"
              required
              fullWidth
              variant="standard"
            />
            <Typography>MODELS</Typography>
            <ToggleButtonGroup exclusive={true}>
              <Grid container={true} spacing={1.25}>
                {displayModels.map((v) => (
                  <Grid key={v} item={true}>
                    <ToggleButton value={v} key={v}>
                      {v}
                    </ToggleButton>
                  </Grid>
                ))}
              </Grid>
            </ToggleButtonGroup>

            <Typography>PARTS</Typography>
            <ToggleButtonGroup exclusive={true}>
              <Grid container={true} spacing={1.25}>
                {displayLEDParts.map((v) => (
                  <Grid key={v} item={true}>
                    <ToggleButton value={v} key={v}>
                      {v}
                    </ToggleButton>
                  </Grid>
                ))}
              </Grid>
            </ToggleButtonGroup>

            <TextField
              margin="normal"
              id="name"
              label="From Time:"
              sx={{ width: "20em", marginRight: 2 }}
              variant="outlined"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button>Cancel</Button>
            <Button>Add</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
}
