import { useState, useEffect } from "react";

// new mui
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
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
import useColorMap from "hooks/useColorMap";
// states and actions
import {
  setCurrentPos,
  setCurrentStatus,
  setSelected,
  initCurrentLedEffect,
  generateLedEffectRecord,
} from "core/actions";

import "./app.css";
import Layout from "containers/Layout";
import { getControl, getPos } from "core/utils";

const theme = createTheme({ palette: { mode: "dark" } });

/**
 * Component for the main
 * @component
 */
const App = () => {
  const { init } = useSelector(selectLoad);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!init) {
      dispatch(fetchLoad());
    }
  }, [init]);

  const [controlLoading, setControlLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // init the currentStatus
        // TODO: check record size and auto generate currentStatus if empty
        const [controlMap, controlRecord] = await getControl();
        setCurrentStatus({ payload: controlMap[controlRecord[0]].status });
        setControlLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const [posLoading, setPosLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // init the currentPos
        // TODO: check record size and auto generate currentPos if empty
        const [posMap, posRecord] = await getPos();
        setCurrentPos({ payload: posMap[posRecord[0]].pos });
        setPosLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const {
    loading: dancerLoading,
    error: dancerError,
    dancerNames,
  } = useDancer();

  useEffect(() => {
    if (!dancerLoading) {
      const selected: any = {};
      dancerNames.forEach(
        (dancer) => (selected[dancer] = { selected: false, parts: [] })
      );
      setSelected({ payload: selected });
    }
  }, [dancerLoading, dancerNames]);

  // initLedEffectIndexMap need dancer's data
  // so wait until the dancerLoading is false
  useEffect(() => {
    if (!dancerLoading) {
      initCurrentLedEffect();
      generateLedEffectRecord();
    }
  }, [dancerLoading]);

  const { loading: colorLoading, error: colorError } = useColorMap();

  return (
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
  );
};

export default App;
