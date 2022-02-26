import PlayBackController from "./PlayBackController";
import TimeController from "./TimeController";
import WaveSurferApp from "../Wavesurfer/WaveSurferApp";
import VolumeSlider from "./VolumeSlider";
import ScaleSlider from "./ScaleSlider";
import FadeSwitch from "./FadeSwitch";

const ControlBar = ({ wavesurfer }: { wavesurfer: WaveSurferApp }) => {
  return (
    <>
      <PlayBackController wavesurfer={wavesurfer} />
      <TimeController />
      <FadeSwitch />
      <VolumeSlider wavesurfer={wavesurfer} />
      <ScaleSlider wavesurfer={wavesurfer} />
    </>
  );
};

export default ControlBar;
