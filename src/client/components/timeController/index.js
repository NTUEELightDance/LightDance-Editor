import React, { useState, useEffect } from "react";
// redux
import { useSelector, useDispatch } from "react-redux";
import {
  selectGlobal,
  setTime,
  setPosFrame,
  setControlFrame,
} from "../../slices/globalSlice";
// mui

// constant
import { TIMECONTROLLER } from "../../constants";

/**
 * Time Data Controller (time, controlFrame, posFrame)
 */
export default function TimeController() {
  // redux
  const dispatch = useDispatch();
  const {
    timeData: { time, controlFrame, posFrame },
  } = useSelector(selectGlobal);

  // constant
  const from = TIMECONTROLLER;
  // handle Change
  const handleChangeTime = (value) => {
    console.log(`${from} ChangeTime ${value}`);
    dispatch(
      setTime({
        from,
        time: parseInt(value, 10),
      })
    );
  };
  const handleChangeControlFrame = (value) => {
    console.log(`${from} ChangeControlFrame ${value}`);
    dispatch(
      setControlFrame({
        from,
        controlFrame: parseInt(value, 10),
      })
    );
  };
  const handleChangePosFrame = (value) => {
    console.log(`${from} ChangePosFrame ${value}`);
    dispatch(
      setPosFrame({
        from,
        posFrame: parseInt(value, 10),
      })
    );
  };

  return (
    <div>
      time:{" "}
      <input
        type="number"
        placeholder="time"
        value={time}
        onChange={(e) => handleChangeTime(e.target.value)}
        min="0"
      />
      status:
      <div className="btn-group" role="group">
        <button
          type="button"
          onClick={() => handleChangeControlFrame(controlFrame - 1)}
        >
          {"<"}
        </button>
        <input
          type="number"
          placeholder="status index"
          value={controlFrame}
          onChange={(e) => handleChangeControlFrame(e.target.value)}
          min="0"
        />
        <button
          type="button"
          onClick={() => handleChangeControlFrame(controlFrame + 1)}
        >
          {">"}
        </button>
      </div>
      pos:
      <div className="btn-group" role="group">
        <button
          type="button"
          onClick={() => handleChangePosFrame(posFrame - 1)}
        >
          {"<"}
        </button>
        <input
          type="number"
          placeholder="position index"
          value={posFrame}
          onChange={(e) => handleChangePosFrame(e.target.value)}
          min="0"
        />
        <button
          type="button"
          onClick={() => handleChangePosFrame(posFrame + 1)}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}
