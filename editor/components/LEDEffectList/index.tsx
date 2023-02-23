import React, { useState } from "react";
import { confirmation } from "core/utils";
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

import useEffectList from "hooks/useEffectList";
import useTimeInput from "hooks/useTimeInput";

// mui materials
import {
  Button,
  Dialog,
  List,
} from "@mui/material";

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
