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
import useControl from "../../hooks/useControl";

/**
 *
 * This is the Wave component
 * @component
 */
const Wavesurfer = ({ cleanMode = false }) => {
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

  const { loading, error, controlMap, controlRecord } = useControl();

  // update Markers
  useEffect(() => {
    if (!loading && controlMap && showMarkers)
      waveSurferApp.updateMarkers(controlMap);
  }, [controlRecord]);

  // update Markers when markers switched on
  useEffect(() => {
    if (loading || !controlMap || !waveSurferApp) return;
    waveSurferApp.toggleMarkers(showMarkers);
  }, [showMarkers]);

  return (
    <div ref={resizeDetectorRef}>
      {cleanMode || (
        <Stack
          direction="row"
          justifyContent="space-evenly"
          alignItems="center"
          spacing={1}
        >
          <ControlBar wavesurfer={waveSurferApp} />
        </Stack>
      )}
      <div id="waveform" />
    </div>
  );
};

export default Wavesurfer;
