import { useState } from "react";

import EffectList from "./EffectList";
import LEDEffectDialog from "./LEDEffectDialog";
import ReferenceDancerNameDialog from "./LEDEffectDialog/ReferenceDancerNameDialog";
import { LEDPartName } from "@/core/models";

export default function LEDEffectList() {
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [partName, setPartName] = useState<LEDPartName | null>(null);
  const [effectName, setEffectName] = useState<string | null>(null);

  const openAddDialog = () => {
    setAddDialogOpen(true);
  };

  const openEditDialog = (partName: LEDPartName, effectName: string) => {
    setPartName(partName);
    setEffectName(effectName);
    if (!partName || !effectName) return;
    setEditDialogOpen(true);
  };

  return (
    <>
      <EffectList
        openAddDialog={openAddDialog}
        openEditDialog={openEditDialog}
      />
      <LEDEffectDialog
        open={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
      />
      <ReferenceDancerNameDialog
        open={editDialogOpen}
        handleClose={() => setEditDialogOpen(false)}
        partName={partName!}
        effectName={effectName!}
      />
    </>
  );
}
