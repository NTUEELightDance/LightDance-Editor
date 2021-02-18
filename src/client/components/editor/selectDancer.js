import React from "react";
import { useSelector, useDispatch } from "react-redux";
// redux selector and actions
import {
  selectGlobal,
  setSelected,
  toggleSelected,
} from "../../slices/globalSlice";
// constants
import { DANCER_NAMES } from "../../constants";

export default function SelectDancer() {
  // redux states
  const { selected } = useSelector(selectGlobal);
  const dispatch = useDispatch();

  // selected
  const handletoggleSelected = (name) => {
    dispatch(toggleSelected(name));
  };
  const handleSelectAll = () => {
    dispatch(setSelected(DANCER_NAMES));
  };
  const handleCancelSelect = () => {
    dispatch(setSelected([]));
  };

  return (
    <div className="input-group" role="group">
      {DANCER_NAMES.map((name) => (
        <div className="form-check form-check-inline" key={`checkbox_${name}`}>
          <input
            className="form-check-input"
            type="checkbox"
            id={`checkbox_${name}`}
            onChange={() => handletoggleSelected(name)}
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
