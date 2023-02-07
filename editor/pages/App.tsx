import { useLayoutEffect, useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

// redux
import { useDispatch } from "react-redux";
// actions
import { fetchLoad } from "@/slices/loadSlice";
// components
import Loading from "@/components/Loading";
// states and actions
import {
  setCurrentPos,
  setCurrentStatus,
  setSelected,
  initCurrentLedEffect,
  generateLedEffectRecord,
  initDancers,
} from "core/actions";

import { getControl, getPos } from "@/core/utils";

import { Selected } from "@/core/models";

/**
 * Component for the main
 * @component
 */
function App() {
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    (async () => {
      await fetchLoad(dispatch);
      await initDancers();
      setReady(true);
    })();
  }, [dispatch]);

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

  // const [posLoading, setPosLoading] = useState<boolean>(true);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       // init the currentPos
  //       // TODO: check record size and auto generate currentPos if empty
  //       const [posMap, posRecord] = await getPos();
  //       setCurrentPos({ payload: posMap[posRecord[0]].pos });
  //       setPosLoading(false);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  // useEffect(() => {
  //   if (!dancerLoading) {
  //     const selected: Selected = {};
  //     dancerNames.forEach(
  //       (dancer) => (selected[dancer] = { selected: false, parts: [] })
  //     );
  //     setSelected({ payload: selected });
  //   }
  // }, [dancerLoading, dancerNames]);

  // // initLedEffectIndexMap need dancer's data
  // // so wait until the dancerLoading is false
  // useEffect(() => {
  //   if (!dancerLoading) {
  //     initCurrentLedEffect();
  //     generateLedEffectRecord();
  //   }
  // }, [dancerLoading]);

  return ready ? <Outlet /> : <Loading />;
}

export default App;
