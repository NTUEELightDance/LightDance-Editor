import { hot } from "react-hot-loader/root";
import React from "react";
// redux
import { Provider } from "react-redux";
import store from "./store";
// context
import WaveSurferAppProvider from "./contexts/wavesurferapp";
import ControllerProvider from "./contexts/controller";
// components
import Pixi from "./components/pixi";
import Wavesurfer from "./components/wavesurfer";
import Preset from "./components/preset";
import Editor from "./components/editor";
import TimeController from "./components/timeController";

/**
 * Component for the main
 * @component
 */
const App = () => {
  return (
    <Provider store={store}>
      {/* <WaveSurferAppProvider> */}
      <ControllerProvider>
        <TimeController />
        {/* <Wavesurfer /> */}
        <Editor />
        <Pixi />
      </ControllerProvider>
      {/* </WaveSurferAppProvider> */}
    </Provider>
  );
};

export default hot(App);
