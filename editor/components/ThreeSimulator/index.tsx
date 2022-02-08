import { useReactiveVar } from "@apollo/client";
import { useState, useEffect, useRef } from "react";
// redux
import { useSelector } from "react-redux";
import { reactiveState } from "../../core/state";
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
  const containerRef = useRef();

  const [threeController, setThreeController] = useState(null);

  const { currentStatus, currentPos } = useSelector(selectGlobal);
  const isPlaying = useReactiveVar(reactiveState.isPlaying);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const newThreeController = new ThreeController(canvas, container);
    newThreeController.init();
    setThreeController(newThreeController);
  }, []);

  useEffect(() => {
    if (threeController) {
      threeController.fetch();
      threeController.isPlaying = isPlaying;
    }
  }, [isPlaying]);

  useEffect(() => {
    if (threeController && threeController.initialized()) {
      threeController.state = {
        ...threeController.state,
        currentStatus,
        currentPos,
      };
      threeController.updateDancers();
      threeController.render();
    }
  }, [threeController, currentStatus]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      ref={containerRef}
    >
      <div ref={canvasRef} />
    </div>
  );
}
