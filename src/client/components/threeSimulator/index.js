import React, { useState, useEffect, useRef } from "react";
// redux
import { useSelector } from "react-redux";
import Stats from "three/examples/jsm/libs/stats.module";
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
  
  let statsPanel;

  useEffect(async() => {
    const canvas = canvasRef.current;
    statsPanel = await new Stats();
    statsPanel.domElement.style.position = "relative";
    canvas.appendChild(statsPanel.domElement);
    // pass in for animation update
    const newThreeController = new ThreeController(canvas, statsPanel);
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
