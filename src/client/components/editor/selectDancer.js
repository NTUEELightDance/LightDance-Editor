import React from "react";
import { useSelector, useDispatch } from "react-redux";
// redux selector and actions
import {
  selectGlobal,
  setSelected,
  toggleSelected,
} from "../../slices/globalSlice";
import { selectLoad } from "../../slices/loadSlice";

export default function SelectDancer() {
  // redux states
  const { selected } = useSelector(selectGlobal);
  const { dancerNames } = useSelector(selectLoad);
  const dispatch = useDispatch();

  // selected
  const handleToggleSelected = (name) => {
    dispatch(toggleSelected(name));
  };
  const handleSelectAll = () => {
    dispatch(setSelected(dancerNames));
  };
  const handleCancelSelect = () => {
    dispatch(setSelected([]));
  };

  return (
    <div className="input-group" role="group">
      {dancerNames.map((name) => (
        <div className="form-check form-check-inline" key={`checkbox_${name}`}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`checkbox_${name}`}
            onChange={() => handleToggleSelected(name)}
            checked={selected.includes(name)}
          />
          <label className="form-check-label" htmlFor={`checkbox_${name}`}>
            {name}
          </label>
        </div>
      ))}
      <button type="button" onClick={handleSelectAll}>
        Select All
      </button>
      <button type="button" onClick={handleCancelSelect}>
        Cancel All
      </button>
    </div>
  );
}
