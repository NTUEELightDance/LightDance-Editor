import React, { useEffect, useContext, useState } from "react";
import { useSelector } from "react-redux";

// mui
import Button from "@material-ui/core/Button";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import StopIcon from "@material-ui/icons/Stop";
import LoopIcon from "@material-ui/icons/Loop";

// my class
import WaveSurferApp from "./waveSurferApp";
import Setting from "./timeline";
// selector
import { selectGlobal } from "../../slices/globalSlice";
import { selectCommand } from "../../slices/commandSlice";
// constants
import { WAVESURFERAPP } from "../../constants";
// contexts
import { WaveSurferAppContext } from "../../contexts/wavesurferContext";

/**
 *
 * This is Wave component
 * @component
 */
const Wavesurfer = () => {
  const { waveSurferApp, initWaveSurferApp, markersToggle } = useContext(
    WaveSurferAppContext
  );
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
  const { controlRecord } = useSelector(selectGlobal);

  //update Markers
  useEffect(() => {
    if (controlRecord && waveSurferApp && markersToggle)
      waveSurferApp.updateMarkers(controlRecord);
  }, [controlRecord]);

  //update Markers when markers switched on
  useEffect(() => {
    if (!controlRecord || !waveSurferApp)return;
    if (markersToggle)
      waveSurferApp.updateMarkers(controlRecord);
    else
      waveSurferApp.clearMarker();
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

  // event
  const handlePlayPause = () => waveSurferApp.playPause();
  const handleStop = () => waveSurferApp.stop();
  const handlePlayLoop = () => waveSurferApp.playLoop();

  return (
    <div style={{ height: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          marginTop: "6px",
          width: "100%",
          zIndex: 10,
        }}
      >
        <div style={{ marginRight: "8px" }}>
          <Button
            size="small"
            variant="text"
            color="default"
            onClick={handlePlayPause}
          >
            <PlayArrowIcon /> / <PauseIcon />
          </Button>
        </div>
        <Button
          size="small"
          variant="text"
          color="default"
          onClick={handleStop}
        >
          <StopIcon />
        </Button>
        <Button
          size="small"
          variant="text"
          color="default"
          onClick={handlePlayLoop}
        >
          <LoopIcon />
        </Button>
      </div>
      <Setting wavesurfer={waveSurferApp} />
      <div id="waveform" />
    </div>
  );
};

export default Wavesurfer;
