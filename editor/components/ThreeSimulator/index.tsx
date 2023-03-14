import { useEffect, useRef, useLayoutEffect } from "react";

// states and actions
import { reactiveState } from "core/state";
import { setCurrentPosToGround } from "core/actions";
import { useReactiveVar } from "@apollo/client";

// hotkeys
import { useHotkeys } from "react-hotkeys-hook";

import { useResizeDetector } from "react-resize-detector";

import { threeController } from "./ThreeController";

import SelectionModeSelector from "components/SelectionModeSelector";

// constants
import { IDLE, POSITION } from "@/constants";

import { isLEDPartName } from "@/core/models";

/**
 * This is Display component
 *
 * @component
 */
export default function ThreeSimulator() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { ref: containerRef } = useResizeDetector({
    onResize: (width, height) => {
      if (threeController.isInitialized()) {
        threeController.resize(width as number, height as number);
      }
    },
  });

  const isPlaying = useReactiveVar(reactiveState.isPlaying);
  const editorState = useReactiveVar(reactiveState.editorState);
  const selectionMode = useReactiveVar(reactiveState.selectionMode);

  const selected = useReactiveVar(reactiveState.selected);
  const selectedLEDs = useReactiveVar(reactiveState.selectedLEDs);
  const currentLEDPartName = useReactiveVar(reactiveState.currentLEDPartName);
  const referenceDancerName = useReactiveVar(
    reactiveState.currentLEDEffectReferenceDancer
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    canvas && threeController.init(canvas, container);
  }, [containerRef]);

  useEffect(() => {
    if (threeController.isInitialized()) {
      threeController.updateSelected(selected, selectionMode);
    }
  }, [selected, selectionMode]);

  useEffect(() => {
    if (threeController.isInitialized()) {
      threeController.controls.deactivate();
      if (editorState !== IDLE) {
        threeController.controls.activate(selectionMode);
      }
    }
  }, [editorState, selectionMode]);

  useEffect(() => {
    threeController.setIsPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (!isLEDPartName(currentLEDPartName) || !referenceDancerName) {
      threeController.deselectLEDs();
      return;
    }

    threeController.updateSelectedLEDs(
      selectedLEDs,
      referenceDancerName,
      currentLEDPartName
    );
  }, [currentLEDPartName, referenceDancerName, selectedLEDs]);

  useEffect(() => {
    if (!isLEDPartName(currentLEDPartName) || !referenceDancerName) {
      threeController.unfocusLEDParts();
      return;
    }

    threeController.focusOnLEDPart(referenceDancerName, currentLEDPartName);
  }, [currentLEDPartName, referenceDancerName]);

  useHotkeys("g", () => {
    if (
      reactiveState.editorState() !== IDLE &&
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
