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
  initCurrentLEDStatus,
  initDancers,
  initCurrentStatus,
  initCurrentPos,
  initColorMap,
  initEffectList,
  syncLEDEffectRecord,
  syncCurrentLEDStatus,
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
        initEffectList(),
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
        initCurrentLEDStatus(),
        syncLEDEffectRecord(),
      ]);

      secondBatchResult.forEach((result) => {
        if (result.status === "rejected") {
          console.error(result.reason);
          throw result.reason;
        }
      });

      const thirdBatchResult = await Promise.allSettled([
        // depends on initCurrentLEDStatus
        syncCurrentLEDStatus(),
      ]);

      thirdBatchResult.forEach((result) => {
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
