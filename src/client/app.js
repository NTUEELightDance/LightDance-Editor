import { hot } from "react-hot-loader/root";
import React from "react";
import { Provider } from "react-redux";
import Pixi from "./features/pixi";
import Wavesurfer from "./features/wavesurfer";
import Preset from "./features/preset";
import Counter from "./features/counter";
import store from "./store";

/**
 * Component for the main
 *
 * @component
 */
const App = () => {
  return (
    <Provider store={store}>
      <div>
        <Pixi />
        <Wavesurfer />
      </div>
    </Provider>
  );
};

export default hot(App);
