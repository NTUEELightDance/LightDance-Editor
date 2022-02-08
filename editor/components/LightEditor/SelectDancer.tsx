import { useEffect } from "react";

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
import { setSelected, toggleSelected } from "../../core/actions";
import { selectLoad } from "../../slices/loadSlice";

export default function SelectDancer() {
  // redux states
  const selected = useReactiveVar(reactiveState.selected);
  const { dancerNames } = useSelector(selectLoad);

  // selected
  const handleToggleSelected = (name: string) => {
    toggleSelected({ payload: name });
  };
  const handleSelectAll = () => {
    setSelected({ payload: dancerNames });
  };
  const handleCancelSelect = () => {
    setSelected({ payload: [] });
  };

  // keyDown to select (0 ~ 9)
  const handleKeyDown = (e) => {
    const index = e.keyCode - 48;
    if (index >= 0 && index < dancerNames.length)
      // between 0 ~ 9
      handleToggleSelected(dancerNames[index]);
  };
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
                checked={selected.includes(name)}
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
