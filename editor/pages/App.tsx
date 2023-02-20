import { useLayoutEffect, useState } from "react";
import { Outlet } from "react-router-dom";

// redux
import { useDispatch } from "react-redux";
// actions
import { fetchLoad } from "@/slices/loadSlice";
// components
import Loading from "@/components/Loading";
// states and actions
import {
  initCurrentLedEffect,
  generateLedEffectRecord,
  initDancers,
  initCurrentStatus,
  initCurrentPos,
  initColorMap,
} from "@/core/actions";

/**
 * Component for the main
 * @component
 */
function App() {
  const [ready, setReady] = useState(false);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    (async () => {
      const firstBatchResult = await Promise.allSettled([
        fetchLoad(dispatch),
        initDancers(),
        initColorMap(),
      ]);

      firstBatchResult.forEach((result) => {
        if (result.status === "rejected") {
          console.error(result.reason);
          throw result.reason;
        }
      });

      const secondBatchResult = await Promise.allSettled([
        initCurrentStatus(),
        initCurrentPos(),
        initCurrentLedEffect(),
        generateLedEffectRecord(),
      ]);

      secondBatchResult.forEach((result) => {
        if (result.status === "rejected") {
          console.error(result.reason);
          throw result.reason;
        }
      });

      setReady(true);
    })();
  }, [dispatch]);

  return ready ? <Outlet /> : <Loading />;
}

export default App;
