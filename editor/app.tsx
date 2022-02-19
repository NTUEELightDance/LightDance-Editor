import { hot } from "react-hot-loader/root";
import { useEffect } from "react";
// mui
import {
  createTheme as obsoleteCreateTheme,
  ThemeProvider as ObsoleteThemeProvider,
} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
// new mui
import { createTheme, ThemeProvider } from "@mui/material";
// redux
import { useSelector, useDispatch } from "react-redux";
// actions
import { selectLoad, fetchLoad } from "./slices/loadSlice";
// components
import Header from "./components/Header";
import Clipboard from "components/Clipboard";
import Loading from "components/Loading";
// hooks
import useControl from "hooks/useControl";
import usePos from "hooks/usePos";
import useDancer from "hooks/useDancer";
// states and actions
import { setCurrentPos, setCurrentStatus, setSelected } from "core/actions";

import "./app.css";
import Layout from "containers/Layout";

const obsoleteTheme = obsoleteCreateTheme({
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
  typography: {
    // In Chinese and Japanese the characters are usually larger,
    // so a smaller fontsize may be appropriate.
    fontSize: 12,
  },
});

const theme = createTheme({ palette: { mode: "dark" } });

/**
 * Component for the main
 * @component
 */
const App = () => {
  const { init } = useSelector(selectLoad);
  const dispatch = useDispatch();

  const {
    loading: dancerLoading,
    error: dancerError,
    dancerNames,
  } = useDancer();

  const {
    loading: controlLoading,
    error: controlError,
    controlMap,
    controlRecord,
  } = useControl();
  const { loading: posLoading, error: posError, posMap, posRecord } = usePos();

  useEffect(() => {
    if (!init) {
      dispatch(fetchLoad());
    }
  }, [init]);

  useEffect(() => {
    if (!controlLoading) {
      if (controlError) console.error(controlError);
      // init the currentStatus
      // TODO: check record size and auto generate currentStatus if empty
      setCurrentStatus({ payload: controlMap[controlRecord[0]].status });
    }
  }, [controlLoading, controlError]);

  useEffect(() => {
    if (!posLoading) {
      if (posError) console.error(posError);
      // init the currentPos
      // TODO: check record size and auto generate currentPos if empty
      setCurrentPos({ payload: posMap[posRecord[0]].pos });
    }
  }, [posLoading, posError]);

  useEffect(() => {
    if (dancerNames) {
      const selected: any = {};
      dancerNames.forEach(
        (dancer) => (selected[dancer] = { selected: false, parts: [] })
      );
      setSelected({ payload: selected });
    }
  }, [dancerNames]);

  return (
    <div>
      <ObsoleteThemeProvider theme={obsoleteTheme}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Clipboard />
          {init && !controlLoading && !posLoading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
              }}
            >
              <Header />
              <div style={{ flexGrow: 1, position: "relative" }}>
                <Layout />
              </div>
            </div>
          ) : (
            <Loading />
          )}
        </ThemeProvider>
      </ObsoleteThemeProvider>
    </div>
  );
};

export default hot(App);
