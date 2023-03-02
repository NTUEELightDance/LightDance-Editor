import { useEffect, useRef, useLayoutEffect } from "react";

// states and actions
import { reactiveState } from "core/state";
import { setCurrentPosToGround, setSelectedLEDParts } from "core/actions";
import { useReactiveVar } from "@apollo/client";

// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

import { useResizeDetector } from "react-resize-detector";

import { threeController } from "./ThreeController";

import SelectionModeSelector from "components/SelectionModeSelector";

// constants
import { IDLE, POSITION } from "@/constants";

/**
 * This is Display component
 *
 * @component
 */
export default function ThreeSimulator() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { ref: containerRef } = useResizeDetector({
    onResize: (width, height) => {
      if (threeController && threeController.isInitialized()) {
        threeController.resize(width as number, height as number);
      }
    },
  });

  const isPlaying = useReactiveVar(reactiveState.isPlaying);
  const editMode = useReactiveVar(reactiveState.editMode);
  const selectionMode = useReactiveVar(reactiveState.selectionMode);

  const selected = useReactiveVar(reactiveState.selected);
  const selectedLEDBulbs = useReactiveVar(reactiveState.selectedLEDBulbs);
  const selectedLEDPart = useReactiveVar(reactiveState.selectedLEDPart);
  const forceUpdateLED = useReactiveVar(reactiveState.forceUpdateLED);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    canvas && threeController.init(canvas, container);
  }, [containerRef]);

  useEffect(() => {
    if (threeController && threeController.isInitialized()) {
      threeController.updateSelected(selected);
    }
  }, [selected]);

  useEffect(() => {
    if (threeController && threeController.isInitialized()) {
      threeController.controls.deactivate();
      if (editMode !== IDLE) {
        threeController.controls.activate(selectionMode);
      }
    }
  }, [editMode, selectionMode]);

  useEffect(() => {
    threeController.setIsPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    threeController.clearSelectedLEDs();
    if (selectedLEDBulbs.length > 0) {
      threeController.updateSelectedLEDs(selectedLEDBulbs, selectedLEDPart);
      threeController.zoomInSelectedLED(selectedLEDPart);
    }
  }, [selectedLEDBulbs, selectedLEDPart, forceUpdateLED]);

  useHotkeys("g", () => {
    if (
      reactiveState.editMode() !== IDLE &&
      reactiveState.selectionMode() === POSITION
    ) {
      setCurrentPosToGround();
    }
  });

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
