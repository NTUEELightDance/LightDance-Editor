import Stats from "three/examples/jsm/libs/stats.module";

import React, { useState, useEffect, useRef } from "react";
// redux
import { useSelector } from "react-redux";
// actions
import { selectGlobal } from "../../slices/globalSlice";
// useSelector

import ThreeController from "./ThreeController";

/**
 * This is Display component
 *
 * @component
 */

export default function ThreeSimulator() {
  const canvasRef = useRef();

  const [threeController, setThreeController] = useState(null);

  const { posRecord, controlRecord, timeData, isPlaying } =
    useSelector(selectGlobal);

  useEffect(() => {
    const canvas = canvasRef.current;
    const newThreeController = new ThreeController(canvas);
    newThreeController.init();
    setThreeController(newThreeController);
  }, []);

  useEffect(() => {
    if (threeController) {
      threeController.startTime = performance.now();
      threeController.waveSuferTime = timeData.time;
      threeController.state = { controlRecord, posRecord };
      threeController.state.timeData = { ...timeData };
      threeController.isPlaying = isPlaying;
    }
  }, [isPlaying]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div ref={canvasRef} />
    </div>
  );
}
