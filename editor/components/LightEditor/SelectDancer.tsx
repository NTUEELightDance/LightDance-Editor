import { useSelector, useDispatch } from "react-redux";
// mui
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";

// state
import { useReactiveVar } from "@apollo/client";
import { reactiveState } from "../../core/state";
// actions
import { setSelectedDancers, toggleSelectedDancer } from "../../core/actions";
import { selectLoad } from "../../slices/loadSlice";
// hotkey
import { useHotkeys } from "react-hotkeys-hook";

export default function SelectDancer() {
  // redux states
  const selected = useReactiveVar(reactiveState.selected);
  const { dancerNames } = useSelector(selectLoad);
  // selected
  const handleToggleSelected = (name: string) => {
    toggleSelectedDancer({ payload: name });
  };
  const handleSelectAll = () => {
    setSelectedDancers({ payload: dancerNames });
  };
  const handleCancelSelect = () => {
    setSelectedDancers({ payload: [] });
  };

  // hotkeys
  useHotkeys("0, 1, 2, 3, 4, 5, 6, 7, 8, 9", (e) => {
    const index: number = (parseInt(e.key, 10) + 9) % 10; // decrease 1
    if (index >= 0 && index < dancerNames.length) {
      handleToggleSelected(dancerNames[index]);
    }
  });


  return (
    <div>
      <FormGroup row>
        {dancerNames.map((name) => (
          <FormControlLabel
            key={name}
            control={
              <Checkbox
                color="primary"
                onChange={() => handleToggleSelected(name)}
                checked={selected[name].selected}
              />
            }
            label={name}
          />
        ))}
      </FormGroup>
      <Button variant="outlined" size="small" onClick={handleSelectAll}>
        Select All
      </Button>
      <Button variant="outlined" size="small" onClick={handleCancelSelect}>
        Cancel All
      </Button>
    </div>
  );
}
