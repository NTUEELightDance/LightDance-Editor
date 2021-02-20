import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Scrollbars from "react-custom-scrollbars";

// mui
import Button from "@material-ui/core/Button";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import StopIcon from "@material-ui/icons/Stop";
// my class
import WaveSurferApp from "./waveSurferApp";
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

  // scroll bar config
  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: "rgba(192,192,200, 0.5)",
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };
  return (
    <div style={{ height: "100%" }}>
      <Scrollbars renderThumbVertical={renderThumb}>
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
              variant="contained"
              color="default"
              onClick={handlePlayPause}
            >
              <PlayArrowIcon /> / <PauseIcon />
            </Button>
          </div>
          <Button
            size="small"
            variant="contained"
            color="default"
            onClick={handleStop}
          >
            <StopIcon />
          </Button>
        </div>
        <div id="waveform" />
      </Scrollbars>
    </div>
  );
};

export default Wavesurfer;
