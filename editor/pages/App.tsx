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
  // initCurrentLedEffect,
  // generateLedEffectRecord,
  initDancers,
  initCurrentStatus,
  initCurrentPos,
} from "core/actions";

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
      await initCurrentStatus();
      await initCurrentPos();
      setReady(true);
    })();
  }, [dispatch]);

  // TODO: init led effect and current led effect
  // initLedEffectIndexMap need dancer's data
  // so wait until the dancerLoading is false
  // useEffect(() => {
  //   if (!dancerLoading) {
  //     initCurrentLedEffect();
  //     generateLedEffectRecord();
  //   }
  // }, [dancerLoading]);

  return ready ? <Outlet /> : <Loading />;
}

export default App;
