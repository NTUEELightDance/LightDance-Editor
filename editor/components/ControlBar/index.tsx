import PlayBackController from "./PlayBackController";
import TimeController from "./TimeController";
import WaveSurferApp from "../Wavesurfer/WaveSurferApp";
import { FadeSwitch } from "./FadeSwitch";

const ControlBar = ({ wavesurfer }: { wavesurfer: WaveSurferApp }) => {
  return (
    <>
      <PlayBackController wavesurfer={wavesurfer} />
      <TimeController />
      <FadeSwitch />
    </>
  );
};

export default ControlBar;
