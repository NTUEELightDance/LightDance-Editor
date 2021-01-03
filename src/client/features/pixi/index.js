import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as PIXI from "pixi.js";
import Dancer from "./dancer";
import { DANCER_NUM } from "../../constants";
import { selectGlobal, setCurrentStatus, setFrame } from "../globalSlice";
import load from "../../data/load.json";
import control from "../../data/control.json";

/**
 * This is Display component
 *
 * @component
 */

const testStatus = {
  HAT1: 1,
  HAT2: 1,
  FACE1: 1,
  FACE2: 1,
  INNER1: 1,
  INNER2: 1,
  L_COAT1: 1,
  L_COAT2: 1,
  R_COAT1: 1,
  R_COAT2: 1,
  L_ARM1: 1,
  L_ARM2: 1,
  R_ARM1: 1,
  R_ARM2: 1,
  L_HAND: 1,
  R_HAND: 1,
  L_PANTS1: 1,
  L_PANTS2: 1,
  R_PANTS1: 1,
  R_PANTS2: 1,
  L_SHOES1: 1,
  L_SHOES2: 1,
  R_SHOES1: 1,
  R_SHOES2: 1,
  LED_CHEST: { name: "", alpha: 0 },
  LED_R_SHOE: { name: "", alpha: 0 },
  LED_L_SHOE: { name: "", alpha: 0 },
  LED_FAN: { name: "", alpha: 0 },
};

const Pixi = () => {
  const [pixiApp, setPixiApp] = useState(null);
  const [dancers, setDancers] = useState(null);

  const dispatch = useDispatch();
  const { selected, currentStatus, currentPos, time, frame } = useSelector(
    selectGlobal
  );

  const initialize = () => {
    const app = new PIXI.Application({ width: 960, height: 720 });
    document.getElementById("main_stage").appendChild(app.view);

    const dancerTemp = [];
    for (let i = 0; i < DANCER_NUM; ++i) {
      dancerTemp.push(new Dancer(i, app, load.Texture));
    }
    setDancers(dancerTemp);

    return app;
  };

  useEffect(() => {
    setPixiApp(initialize());
  }, []);
  /*
  useEffect(() => {
    console.log(selected);
    if (dancers && selected && selected.length) {
      dancers[selected[0]].update(testStatus);
      dispatch(setCurrentStatus([selected[0], testStatus]));
    }
  }, [selected]);

  useEffect(() => {
    console.log("currentPos", currentPos);
  }, [currentPos]);

  useEffect(() => {
    console.log("currentStatus", currentStatus);
  }, [currentStatus]);
 
  useEffect(() => {
    console.log(frame);
  }, [frame]);
  */
  useEffect(() => {
    if (time >= control[0][frame + 1].Start) {
      dispatch(setFrame(frame + 1));
      dancers.forEach((dancer, i) => {
        dancer.update(control[i][frame + 1].Status);
      });
    }
  }, [time]);

  return (
    <div className="Simulator">
      <div id="main_stage"></div>
    </div>
  );
};

export default Pixi;
