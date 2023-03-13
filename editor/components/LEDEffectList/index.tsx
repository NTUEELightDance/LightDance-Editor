import { useState } from "react";

import EffectList from "./EffectList";
import LEDEffectDialog from "./LEDEffectDialog";
import { LEDPartName } from "@/core/models";

export default function LEDEffectList() {
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [effectName, setEffectName] = useState<string | null>(null);
  const [partName, setPartName] = useState<LEDPartName | null>(null);

  const openDialog = (data?: { effectName: string; partName: LEDPartName }) => {
    setAddDialogOpen(true);
    if (data) {
      setEffectName(data.effectName);
      setPartName(data.partName);
    }
  };

  return (
    <>
      <EffectList openDialog={openDialog}></EffectList>
      <LEDEffectDialog
        open={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
        effectName={effectName}
        partName={partName}
      />
    </>
  );
}
