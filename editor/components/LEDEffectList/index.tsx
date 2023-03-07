import { useState } from "react";

// mui materials
import { Button, Grid, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import EffectList from "./EffectList";
import LEDEffectDialog from "./LEDEffectDialog";

export default function LEDEffectList() {
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

  const openDialog = () => {
    setAddDialogOpen(true);
  };

  return (
    <div>
      <Paper
        sx={{
          width: "100%",
          minHeight: "100%",
        }}
      >
        <EffectList openDialog={openDialog}></EffectList>
      </Paper>
      <LEDEffectDialog
        addDialogOpen={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
      ></LEDEffectDialog>
    </div>
  );
}
