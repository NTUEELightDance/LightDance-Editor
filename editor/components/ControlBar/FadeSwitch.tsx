import { Switch, FormControlLabel } from "@mui/material";

import { setCurrentFade } from "@/core/actions";

import { reactiveState } from "@/core/state";
import { useReactiveVar } from "@apollo/client";

function FadeSwitch() {
  const currentFade = useReactiveVar(reactiveState.currentFade);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setCurrentFade({ payload: checked });
  };

  return (
    <FormControlLabel
      control={<Switch onChange={handleChange} checked={currentFade} />}
      label="Fade"
      labelPlacement="start"
    />
  );
}

export default FadeSwitch;
