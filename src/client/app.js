import { hot } from "react-hot-loader/root";
import React from "react";
import Pixi from "./features/pixi";
import Wavesurfer from "./features/wavesurfer";
import Preset from "./features/preset";

/**
 * Component for the main
 *
 * @component
 */
const App = () => {
  return (
    <div>
      <h1>This is 2021 LightDance Editor</h1>
      <Pixi />
      <Wavesurfer />
      <Preset />
    </div>
  );
};

export default hot(App);
