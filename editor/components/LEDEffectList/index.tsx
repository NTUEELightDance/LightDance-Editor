import { useState } from "react";

import EffectList from "./EffectList";
import LEDEffectDialog from "./LEDEffectDialog";

export default function LEDEffectList() {
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

  const openDialog = () => {
    setAddDialogOpen(true);
  };

  return (
    <>
      <EffectList openDialog={openDialog}></EffectList>
      <LEDEffectDialog
        open={addDialogOpen}
        handleClose={() => {
          setAddDialogOpen(false);
        }}
      />
    </>
  );
}
