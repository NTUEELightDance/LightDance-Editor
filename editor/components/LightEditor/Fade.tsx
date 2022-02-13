// mui
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
// states and actions
import { reactiveState } from "core/state";
import { setCurrentFade } from "core/actions";
import { useReactiveVar } from "@apollo/client";
// constants
import { IDLE } from "constants";

/**
 * Fade button
 * @component
 */
export default function Fade() {
  const mode = useReactiveVar(reactiveState.editMode);
  const currentFade = useReactiveVar(reactiveState.currentFade);

  // handle action
  const handleSwitchFade = () => {
    setCurrentFade({ payload: !currentFade });
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={currentFade}
          disabled={mode === IDLE}
          onChange={handleSwitchFade}
          name="switchFade"
          color="primary"
        />
      }
      label="fade"
    />
  );
}
