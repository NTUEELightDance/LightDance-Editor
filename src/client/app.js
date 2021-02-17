import { hot } from "react-hot-loader/root";
import React from "react";
// redux
import { Provider } from "react-redux";
import store from "./store";
// context
import ControllerProvider from "./controllerContext";
// components
import Pixi from "./components/pixi";
import Wavesurfer from "./components/wavesurfer";
import Preset from "./components/preset";
import Editor from "./components/editor";

/**
 * Component for the main
 * @component
 */
const App = () => {
  return (
    <Provider store={store}>
      <ControllerProvider>
        <Pixi />
        {/* <Editor /> */}
        <Wavesurfer />
      </ControllerProvider>
    </Provider>
  );
};

export default hot(App);
