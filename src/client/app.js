import { hot } from "react-hot-loader/root";
import React from "react";
import { Provider } from "react-redux";
import Pixi from "./features/pixi";
import Wavesurfer from "./features/wavesurfer";
import Preset from "./features/preset";
import Counter from "./features/counter";
import Editor from "./features/editor";
import store from "./store";
import ControllerProvider from "./controllerContext";

/**
 * Component for the main
 *
 * @component
 */
const App = () => {
  return (
    <Provider store={store}>
      <ControllerProvider>
        <Pixi />
        <Editor />
        <Wavesurfer />
      </ControllerProvider>
    </Provider>
  );
};

export default hot(App);
