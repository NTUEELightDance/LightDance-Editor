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
import { wavesurferContext } from "types/components/wavesurfer";
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
  ) as wavesurferContext;

  const { ref: resizeDetectorRef } = useResizeDetector({
    onResize: () => {
      waveSurferApp.resize();
    },
  });

  useLayoutEffect(() => {
    initWaveSurferApp();
  }, [initWaveSurferApp]);

  const editor = useReactiveVar(reactiveState.editor);
  const { loading: controlLoading, controlMap, controlRecord } = useControl();
  const { loading: posLoading, posMap, posRecord } = usePos();
  const { currentLEDEffect, currentLEDEffectStart } = useLEDEditor();

  // update Markers
  useEffect(() => {
    if (editor === "CONTROL_EDITOR") {
      if (!controlLoading && controlMap && showMarkers) {
        const timestamps = Object.values(controlMap).map(
          (frame) => frame.start
        );
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
  ]);

  // update Pos Markers
  useEffect(() => {
    if (editor === "POS_EDITOR") {
      if (!posLoading && posMap && showMarkers) {
        const timestamps = Object.values(posMap).map((frame) => frame.start);
        waveSurferApp.updateMarkers(timestamps);
      }
    }
  }, [editor, posRecord, posMap, posLoading, showMarkers, waveSurferApp]);

  useEffect(() => {
    if (editor === "LED_EDITOR") {
      if (currentLEDEffect === null) return;
      const timestamps = currentLEDEffect.effects.map(
        (effect) => effect.start + currentLEDEffectStart
      );
      waveSurferApp.updateMarkers(timestamps);
    }
  }, [currentLEDEffect, currentLEDEffectStart, editor, waveSurferApp]);

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
