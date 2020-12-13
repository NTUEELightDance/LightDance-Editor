import React, { useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import toLoad from "./pixiClasses/toLoad.json";
import BlackPart from "./pixiClasses/BlackPart";

/**
 * This is Display component
 *
 * @component
 */

const Pixi = () => {
  const [pixiApp, setPixiApp] = useState(null);
  //const toLoad = {};
  const texture = {};
  console.log(toLoad);

  const initialize = () => {
    const app = new PIXI.Application({ width: 500, height: 500 });
    const BlackParts = [];
    document.getElementById("main_stage").appendChild(app.view);
    toLoad.BlackPart.forEach((imageName) => {
      app.loader.add(imageName, "./asset/BlackPart/" + imageName + ".svg");
    });

    toLoad.BlackPart.forEach((imageName) => {
      BlackParts.push(new BlackPart("dancer1", imageName));
    });

    toLoad.BlackPart.forEach((imageName) => {
      app.loader.load((loader, resources) => {
        texture[imageName] = PIXI.Texture.from(imageName);
      });
    });
    console.log(BlackParts);

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
