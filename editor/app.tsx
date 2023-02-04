import { useState, useEffect } from "react";

// new mui
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
// redux
import { useSelector, useDispatch } from "react-redux";
// actions
import { selectLoad, fetchLoad } from "./slices/loadSlice";
// components
import Loading from "components/Loading";
// hooks
import useDancer from "hooks/useDancer";
// states and actions
import {
  setCurrentPos,
  setCurrentStatus,
  setSelected,
  initCurrentLedEffect,
  generateLedEffectRecord
} from "core/actions";

import { getControl, getPos } from "core/utils";

import Router from "@/routes";

const theme = createTheme({ palette: { mode: "dark" } });

/**
 * Component for the main
 * @component
 */
function App() {
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
    dancerNames
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {init && !controlLoading && !posLoading
        ? (
          <Router />
        )
        : (
          <Loading />
        )}
    </ThemeProvider>
  );
}

export default App;
