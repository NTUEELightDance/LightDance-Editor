import { useState, useEffect, useRef } from "react";
// redux
import { useSelector } from "react-redux";

// states and actions
import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";

import { threeController } from "./ThreeController";
import SelectionModeSelector from "components/SelectionModeSelector";

/**
 * This is Display component
 *
 * @component
 */
export default function ThreeSimulator() {
  const canvasRef = useRef();
  const containerRef = useRef();
  const isPlaying = useReactiveVar(reactiveState.isPlaying);
  const currentPos = useReactiveVar(reactiveState.currentPos);
  const currentStatus = useReactiveVar(reactiveState.currentStatus);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    threeController.init(canvas, container);
  }, []);

  useEffect(() => {
    threeController.fetch();
    threeController.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (threeController.initialized()) {
      threeController.state = {
        ...threeController.state,
        currentStatus,
        currentPos,
      };
      threeController.updateDancers();
      threeController.render();
    }
  }, [currentStatus]);

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
      <SelectionModeSelector />
    </div>
  );
}
