import React, { useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import toLoad from "./pixiClasses/toLoad.json";
import Dancer from "./dancer";
import { DANCER_NUM } from "../../constants";

import load from "../../data/load.json";

/**
 * This is Display component
 *
 * @component
 */

const Pixi = () => {
  const [pixiApp, setPixiApp] = useState(null);
  const [dancers, setDancers] = useState(null);

  const texture = {};
  console.log(toLoad);

  const initialize = () => {
    const app = new PIXI.Application({ width: 960, height: 720 });
    const BlackParts = [];
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

  useEffect(() => {
    console.log(pixiApp);
  }, [pixiApp]);

  return (
    <div className="Simulator">
      <div id="main_stage"></div>
    </div>
  );
};

export default Pixi;
