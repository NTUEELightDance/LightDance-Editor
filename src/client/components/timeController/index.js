import React, { useState, useEffect } from "react";
// redux
import { useSelector, useDispatch } from "react-redux";
import {
  selectGlobal,
  setTime,
  setPosIdx,
  setStatusIdx,
} from "../../slices/globalSlice";
// mui

// constant
import { TIMECONTROLLER } from "../../constants";

/**
 * Time Data Controller (time, statusIdx, posIdx)
 */
export default function TimeController() {
  // redux
  const dispatch = useDispatch();
  const {
    timeData: { time, statusIdx, posIdx },
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
  const handleChangeStatusIdx = (value) => {
    console.log(`${from} ChangeStatusIdx ${value}`);
    dispatch(
      setStatusIdx({
        from,
        statusIdx: parseInt(value, 10),
      })
    );
  };
  const handleChangePosIdx = (value) => {
    console.log(`${from} ChangePosIdx ${value}`);
    dispatch(
      setPosIdx({
        from,
        posIdx: parseInt(value, 10),
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
          onClick={() => handleChangeStatusIdx(statusIdx - 1)}
        >
          {"<"}
        </button>
        <input
          type="number"
          placeholder="status index"
          value={statusIdx}
          onChange={(e) => handleChangeStatusIdx(e.target.value)}
          min="0"
        />
        <button
          type="button"
          onClick={() => handleChangeStatusIdx(statusIdx + 1)}
        >
          {">"}
        </button>
      </div>
      pos:
      <div className="btn-group" role="group">
        <button type="button" onClick={() => handleChangePosIdx(posIdx - 1)}>
          {"<"}
        </button>
        <input
          type="number"
          placeholder="position index"
          value={posIdx}
          onChange={(e) => handleChangePosIdx(e.target.value)}
          min="0"
        />
        <button type="button" onClick={() => handleChangePosIdx(posIdx + 1)}>
          {">"}
        </button>
      </div>
    </div>
  );
}
