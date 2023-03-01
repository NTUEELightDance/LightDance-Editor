import React, { useState } from "react";

// mui materials
import { Button, List, Grid } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import LEDEffectDialog from "./LEDEffectDialog";

export default function LEDEffectList() {
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

  const openDialog = () => {
    setAddDialogOpen(true);
  };

  return (
    <div>
      <List></List>
      <Grid
        container
        justifyContent="center"
        sx={{
          width: "100%",
          minHeight: "80px",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button variant="outlined" startIcon={<AddIcon />} onClick={openDialog}>
          LED EFFECT
        </Button>
      </Grid>

      <LEDEffectDialog
        addDialogOpen={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
      ></LEDEffectDialog>
    </div>
  );
}
