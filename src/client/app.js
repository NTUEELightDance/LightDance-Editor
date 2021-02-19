import { hot } from "react-hot-loader/root";
import React, { useEffect } from "react";
// mui
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
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

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#94BBFF",
      dark: "#94BBFF",
    },
    background: {
      paper: "#292929",
      default: "#121212",
    },
  },
});

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
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ControllerProvider>
            {/* <WaveSurferAppProvider> */}
            <TimeController />
            {/* <Wavesurfer /> */}
            <div style={{ display: "flex" }}>
              <Pixi />
              <Editor />
            </div>
            {/* </WaveSurferAppProvider> */}
          </ControllerProvider>
        </ThemeProvider>
      ) : (
        "Loading..."
      )}
    </div>
  );
};

export default hot(App);
