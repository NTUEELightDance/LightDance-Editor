import React, { useEffect, useContext, useState } from "react";
import { useSelector } from "react-redux";

// my class
import WaveSurferApp from "./WaveSurferApp";
import ControlBar from "../ControlBar";
// selector
import { selectGlobal } from "../../slices/globalSlice";
import { selectCommand } from "../../slices/commandSlice";
// constants
import { WAVESURFERAPP } from "../../constants";
// contexts
import { WaveSurferAppContext } from "../../contexts/WavesurferContext";
//types
import { wavesurferContext } from "types/components/wavesurfer";

import Stack from "@mui/material/Stack";

/**
 *
 * This is the Wave component
 * @component
 */
const Wavesurfer = ({ cleanMode = false }) => {
  const { waveSurferApp, initWaveSurferApp, markersToggle } = useContext(
    WaveSurferAppContext
  ) as wavesurferContext;
  // const [waveSurferApp, setWaveSurferApp] = useState(null);
  useEffect(() => {
    const newWaveSurferApp = new WaveSurferApp();
    newWaveSurferApp.init();
    initWaveSurferApp(newWaveSurferApp);
  }, []);

  // redux
  const {
    timeData: { from, time },
  } = useSelector(selectGlobal);
  const { controlRecord, controlMap } = useSelector(selectGlobal);

  //update Markers
  useEffect(() => {
    if (controlMap && waveSurferApp && markersToggle)
      waveSurferApp.updateMarkers(controlMap);
  }, [controlRecord]);

  //update Markers when markers switched on
  useEffect(() => {
    if (!controlMap || !waveSurferApp) return;
    if (markersToggle) waveSurferApp.updateMarkers(controlMap);
    else waveSurferApp.clearMarker();
  }, [markersToggle]);

  // listen to time set by other component
  useEffect(() => {
    if (waveSurferApp) {
      if (from !== WAVESURFERAPP) {
        try {
          waveSurferApp.seekTo(time);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }, [waveSurferApp, time]);

  return (
    <>
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
      <div id="waveform" style={{ position: "relative" }} />
    </>
  );
};

export default Wavesurfer;
