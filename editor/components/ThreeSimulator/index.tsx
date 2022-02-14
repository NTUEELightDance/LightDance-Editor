import { useEffect, useRef, useLayoutEffect } from "react";

// states and actions
import { reactiveState } from "../../core/state";
import { useReactiveVar } from "@apollo/client";

import { threeController } from "./ThreeController";
import SelectionModeSelector from "components/SelectionModeSelector";

// constants
import { IDLE, DANCER, PART, POSITION } from "constants";

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
  const editMode = useReactiveVar(reactiveState.editMode);
  const selectionMode = useReactiveVar(reactiveState.selectionMode);

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

      threeController.controls.dragControls.deactivate();
      threeController.controls.selectControls.deactivate();
      threeController.controls.deactivate();
      if (editMode !== IDLE) {
        threeController.controls.activate();
        console.log(selectionMode);

        switch (selectionMode) {
          case DANCER:
            threeController.controls.selectControls.activate();
          case PART:
            threeController.controls.selectControls.activate();
          case POSITION:
            threeController.controls.dragControls.activate();
        }
      }
    }
  }, [editMode, selectionMode]);

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
