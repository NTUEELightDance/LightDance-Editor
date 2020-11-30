import { hot } from "react-hot-loader/root";

import React from "react";
import ReactDOM from "react-dom";

import Pixi from "./features/pixi";
import Wavesurfer from "./features/wavesurfer";

let App = () => {
  return (
    <div>
      <h1>This is 2021 LightDance Editor</h1>
      <Pixi />
      <Wavesurfer />
    </div>
  );
};

App = hot(App);

ReactDOM.render(<App />, document.getElementById("app"));
