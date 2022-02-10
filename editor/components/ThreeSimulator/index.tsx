import { useState, useEffect, useRef, useLayoutEffect } from "react";
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
  const mode = useReactiveVar(reactiveState.mode);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    threeController.init(canvas, container);
  }, []);

  // useEffect(() => {
  //   if (isPlaying) {
  //     threeController.play();
  //   } else {
  //     threeController.stop();
  //   }
  // }, [isPlaying]);

  useEffect(() => {
    if (threeController && threeController.initialized()) {
      // threeController.dragControlInit();
      if (!threeController.controls.dragControls) {
        threeController.controls.initDragControls();
        threeController.controls.initDanceSelector();
      }
      if (mode === 0) {
        threeController.controls.enableSelection = false;
        threeController.controls.dragControls.deactivate();
      } else {
        threeController.controls.enableSelection = true;
        threeController.controls.dragControls.activate();
      }
    }
  }, [mode]);

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
