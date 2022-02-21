import PlayBackController from "./PlayBackController";
import TimeController from "./TimeController";
import WaveSurferApp from "../Wavesurfer/WaveSurferApp";
import VolumeSlider from "./VolumeSlider";
import FadeSwitch from "./FadeSwitch";

const ControlBar = ({ wavesurfer }: { wavesurfer: WaveSurferApp }) => {
  return (
    <>
      <PlayBackController wavesurfer={wavesurfer} />
      <TimeController />
      <FadeSwitch />
      <VolumeSlider wavesurfer={wavesurfer} />
    </>
  );
};

export default ControlBar;
