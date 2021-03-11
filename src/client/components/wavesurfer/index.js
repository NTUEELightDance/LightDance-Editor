import React, { useEffect, useState } from "react";
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
// constants
import { WAVESURFERAPP } from "../../constants";

/**
 *
 * This is Wave component
 * @component
 */
const Wavesurfer = () => {
  const [waveSurferApp, setWaveSurferApp] = useState(null);

  useEffect(() => {
    const newWaveSurferApp = new WaveSurferApp();
    newWaveSurferApp.init();
    setWaveSurferApp(newWaveSurferApp);
  }, []);

  // redux
  const {
    timeData: { from, time },
  } = useSelector(selectGlobal);

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

  // const syncPost = (type, mode, data) => {
  //   const myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  //   const urlencoded = new URLSearchParams();
  //   urlencoded.append("type", type);
  //   urlencoded.append("mode", mode);
  //   urlencoded.append("data", data);

  //   const requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: urlencoded,
  //     redirect: "follow",
  //   };

  //   return fetch("/api/sync", requestOptions)
  //     .then((response) => response.text())
  //     .then((result) => console.log(result))
  //     .catch((error) => console.log("error", error));
  // };

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
