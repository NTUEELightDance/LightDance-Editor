import { useState } from "react";

// mui materials
import { Button, Grid, Fab } from "@mui/material";
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
      <Grid
        container
        justifyContent="center"
        sx={{
          width: "100%",
          minHeight: "80px",
          //justifyContent: "center",
          //alignItems: "center",
        }}
      >
        <Fab
          onClick={openDialog}
          style={{
            //position: "fixed",
            // bottom: "50%",
            // left: "50%",
          }}
        >
          <AddIcon />
        </Fab>
      </Grid>
      <EffectList></EffectList>

      <LEDEffectDialog
        addDialogOpen={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
      ></LEDEffectDialog>
    </div>
  );
}
