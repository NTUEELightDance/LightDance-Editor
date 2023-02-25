import React, { useState } from "react";

// mui materials
import { Button, List } from "@mui/material";

import LEDEffectDialog from "./LEDEffectDialog";

export default function LEDEffectList() {
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

  const openDialog = () => {
    setAddDialogOpen(true);
  };

  return (
    <div>
      <List></List>
      <Button onClick={openDialog}>Add</Button>
      <LEDEffectDialog
        addDialogOpen={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
      ></LEDEffectDialog>
    </div>
  );
}
