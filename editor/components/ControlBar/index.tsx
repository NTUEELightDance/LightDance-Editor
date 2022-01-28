import PlayBackController from "./PlayBackController";
import TimeController from "./TimeController";
import WaveSurferApp from "../Wavesurfer/WaveSurferApp";
import Tools from "./Tools";
import MarkerSwitch from "./MarkerSwitch";

const ControlBar = ({ wavesurfer }: { wavesurfer: WaveSurferApp }) => {
  return (
    <>
      <PlayBackController wavesurfer={wavesurfer} />
      <TimeController />
      <Tools />
      <MarkerSwitch />
    </>
  );
};

export default ControlBar;
