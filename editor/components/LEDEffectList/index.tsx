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
        <EffectList></EffectList>
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={openDialog}
            //sx={{ position: "absolute", top: "16px", right: "16px" }}
          >
            LED Effect
          </Button>
        </Grid>
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
