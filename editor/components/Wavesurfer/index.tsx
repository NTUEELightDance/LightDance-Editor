import { useEffect, useContext, useLayoutEffect } from "react";
import { useResizeDetector } from "react-resize-detector";
// mui
import Stack from "@mui/material/Stack";
// components
import ControlBar from "../ControlBar";
// contexts
import { WaveSurferAppContext } from "../../contexts/WavesurferContext";
// types
import { wavesurferContext } from "types/components/wavesurfer";
// hooks
import useControl from "hooks/useControl";
import usePos from "hooks/usePos";
// actions and states
import { reactiveState } from "core/state";
import { useReactiveVar } from "@apollo/client";
// constants
import { CONTROL_EDITOR, POS_EDITOR } from "@/constants";

/**
 *
 * This is the Wave component
 * @component
 */
function Wavesurfer({ commandMode = false }) {
  const { waveSurferApp, initWaveSurferApp, showMarkers } = useContext(
    WaveSurferAppContext
  ) as wavesurferContext;

  const { ref: resizeDetectorRef } = useResizeDetector({
    onResize: (width, height) => {
      waveSurferApp.resize();
    },
  });

  useLayoutEffect(() => {
    initWaveSurferApp();
  }, []);

  const { loading: controlLoading, controlMap, controlRecord } = useControl();
  const { loading: posLoading, posMap, posRecord } = usePos();

  const editor = useReactiveVar(reactiveState.editor);
  // update Markers
  useEffect(() => {
    if (editor === CONTROL_EDITOR) {
      if (!controlLoading && controlMap && showMarkers) {
        waveSurferApp.updateMarkers(controlMap);
      }
    }
  }, [editor, controlRecord, controlMap]);

  // update Pos Markers
  useEffect(() => {
    if (editor === POS_EDITOR) {
      if (!posLoading && posMap && showMarkers) {
        waveSurferApp.updateMarkers(posMap);
      }
    }
  }, [editor, posRecord, posMap]);

  // update Markers when markers switched on
  useEffect(() => {
    if (
      controlLoading ||
      posLoading ||
      !controlMap ||
      !posMap ||
      !waveSurferApp
    ) {
      return;
    }
    waveSurferApp.toggleMarkers(showMarkers);
  }, [showMarkers]);

  return (
    <div ref={resizeDetectorRef}>
      <Stack
        direction="row"
        justifyContent="space-evenly"
        alignItems="center"
        spacing={1}
      >
        <ControlBar wavesurfer={waveSurferApp} />
      </Stack>
      <div id="waveform" />
    </div>
  );
}

export default Wavesurfer;
