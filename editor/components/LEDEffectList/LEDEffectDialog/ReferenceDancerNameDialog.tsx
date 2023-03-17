import { LEDPartName } from "@/core/models";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
} from "@mui/material";
import SingleSelectButtonArray from "../../SingleSelectButtonArray";
import { useState } from "react";
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "@/core/state";
import { setupLEDEditor } from "@/core/actions";

interface ReferenceDancerNameDialogProps {
  open: boolean;
  handleClose: () => void;
  partName: LEDPartName;
  effectName: string;
}

export default function ReferenceDancerNameDialog({
  open,
  handleClose,
  partName,
  effectName,
}: ReferenceDancerNameDialogProps) {
  const dancers = useReactiveVar(reactiveState.dancers);
  const [chosenDancer, setChosenDancer] = useState<string | null>(null);

  const closeAndReset = () => {
    setChosenDancer(null);
    handleClose();
  };

  const handleEdit = async () => {
    if (!chosenDancer) return;

    await setupLEDEditor({
      payload: {
        dancerName: chosenDancer,
        partName,
        effectName,
      },
    });
    closeAndReset();
  };

  return (
    <Paper>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Reference Dancer Name</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ pb: 2 }}>
            Please select a dancer for reference.
          </DialogContentText>
          <SingleSelectButtonArray
            selectedOption={chosenDancer}
            handleChangeSelectedOption={setChosenDancer}
            displayedOptions={Object.keys(dancers)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleEdit} disabled={!chosenDancer}>
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
