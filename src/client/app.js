import { hot } from "react-hot-loader/root";
import React, { useEffect } from "react";
// redux
import { useSelector, useDispatch } from "react-redux";
import { selectLoad, fetchLoad } from "./slices/loadSlice";
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
  const { init } = useSelector(selectLoad);
  const dispatch = useDispatch();
  useEffect(async () => {
    if (!init) await dispatch(fetchLoad());
  }, [init]);
  return (
    <div>
      {init ? (
        // {/* <WaveSurferAppProvider> */}
        <ControllerProvider>
          <TimeController />
          {/* <Wavesurfer /> */}
          <Editor />
          <Pixi />
        </ControllerProvider>
      ) : (
        // {/* </WaveSurferAppProvider> */}
        "Loading..."
      )}
    </div>
  );
};

export default hot(App);
