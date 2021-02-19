import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Scrollbars from "react-custom-scrollbars";
// redux selector and actions
import { selectGlobal, setMode } from "../../slices/globalSlice";
// components
import SelectDancer from "./selectDancer";
import SlidebarList from "./slidebarList";
// constants
import { IDLE, ADD, EDIT } from "../../constants";

export default function Editor() {
  // redux states
  const { mode } = useSelector(selectGlobal);
  const dispatch = useDispatch();

  // mode
  const handleChangeMode = (m) => {
    if (m === mode) dispatch(setMode(IDLE));
    else dispatch(setMode(m));
  };
  const handleSave = () => {
    dispatch(setMode(IDLE));
    // TODO
    // check time, mode ...
  };
  const handleDelete = () => {
    // TODO
  };

  // scroll bar config
  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: "rgba(192,192,200, 0.5)",
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  return (
    <div
      id="editor"
      className="col-4 d-inline-block container"
      style={{ height: "720px" }} // ugly for now
    >
      <Scrollbars renderThumbVertical={renderThumb}>
        <div>
          <div className="btn-group" role="group" aria-label="Basic example">
            <button type="button" onClick={() => handleChangeMode(EDIT)}>
              EDIT
            </button>
            <button type="button" onClick={() => handleChangeMode(ADD)}>
              ADD
            </button>
            <button type="button" onClick={handleSave}>
              SAVE
            </button>
          </div>
        </div>
        <SelectDancer />
        <SlidebarList />
        {/* TODO: led slider, selection  */}

        <button type="button" onClick={handleDelete}>
          DEL
        </button>
      </Scrollbars>
    </div>
  );
}
