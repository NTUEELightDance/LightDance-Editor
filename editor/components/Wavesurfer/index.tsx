import { useEffect, useContext, useLayoutEffect } from "react";
import { useResizeDetector } from "react-resize-detector";
// mui
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
// components
import ControlBar from "../ControlBar";
// contexts
import { WaveSurferAppContext } from "../../contexts/WavesurferContext";
// types
import { WavesurferContextType } from "@/contexts/WavesurferContext";
// hooks
import useControl from "hooks/useControl";
import usePos from "hooks/usePos";
import useLEDEditor from "@/hooks/useLEDEditor";
// actions and states
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";

/**
 *
 * This is the Wave component
 * @component
 */
function Wavesurfer() {
  const { waveSurferApp, initWaveSurferApp, showMarkers } = useContext(
    WaveSurferAppContext
  ) as WavesurferContextType;

  const { ref: resizeDetectorRef } = useResizeDetector({
    onResize: () => {
      waveSurferApp.resize();
    },
  });

  useLayoutEffect(() => {
    initWaveSurferApp();
  }, [initWaveSurferApp]);

  const editor = useReactiveVar(reactiveState.editor);
  const editingData = useReactiveVar(reactiveState.editingData);
  const editorState = useReactiveVar(reactiveState.editorState);
  const { loading: controlLoading, controlMap, controlRecord } = useControl();
  const { loading: posLoading, posMap, posRecord } = usePos();
  const { currentLEDEffect, currentLEDEffectStart } = useLEDEditor();

  // update Markers
  useEffect(() => {
    if (editor === "CONTROL_EDITOR") {
      if (!controlLoading && controlMap && showMarkers) {
        const timestamps = Object.entries(controlMap).map(([id, frame]) => ({
          startSecond: frame.start,
          frameID: parseInt(id),
          // draggable: editingData.frameId === parseInt(id),
        }));
        waveSurferApp.updateMarkers(timestamps);
      }
    }
  }, [
    editor,
    controlRecord,
    controlMap,
    controlLoading,
    showMarkers,
    waveSurferApp,
    editingData.frameId,
  ]);

  // update Pos Markers
  useEffect(() => {
    if (editor === "POS_EDITOR") {
      if (!posLoading && posMap && showMarkers) {
        const timestamps = Object.entries(posMap).map(([id, frame]) => ({
          startSecond: frame.start,
          frameID: parseInt(id),
          // draggable: editingData.frameId === parseInt(id),
        }));
        waveSurferApp.updateMarkers(timestamps);
      }
    }
  }, [
    editor,
    posRecord,
    posMap,
    posLoading,
    showMarkers,
    waveSurferApp,
    editingData.frameId,
  ]);

  useEffect(() => {
    if (editor === "LED_EDITOR") {
      if (currentLEDEffect === null) return;
      const timestamps = currentLEDEffect.effects.map((effect, index) => ({
        startSecond: effect.start + currentLEDEffectStart,
        frameID: index,
        draggable: editorState === "EDITING",
      }));
      waveSurferApp.updateMarkers(timestamps);
    }
  }, [
    currentLEDEffect,
    currentLEDEffectStart,
    editor,
    waveSurferApp,
    editorState,
  ]);

  // update Markers when markers switched on
  useEffect(() => {
    if (controlLoading || posLoading || !waveSurferApp) {
      return;
    }
    waveSurferApp.toggleMarkers(showMarkers);
  }, [
    controlLoading,
    controlMap,
    posLoading,
    posMap,
    showMarkers,
    waveSurferApp,
  ]);

  return (
    <div ref={resizeDetectorRef}>
      <Box sx={{ display: "grid", placeItems: "center" }}>
        <Stack direction="row" alignItems="center" spacing="2rem">
          <ControlBar wavesurfer={waveSurferApp} />
        </Stack>
      </Box>
      <div id="waveform" />
    </div>
  );
}

export default Wavesurfer;
