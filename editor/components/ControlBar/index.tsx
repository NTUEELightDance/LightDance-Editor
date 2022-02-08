import PlayBackController from "./PlayBackController";
import TimeController from "./TimeController";
import WaveSurferApp from "../Wavesurfer/WaveSurferApp";
import MarkerSwitch from "./MarkerSwitch";

const ControlBar = ({ wavesurfer }: { wavesurfer: WaveSurferApp }) => {
  return (
    <>
      <PlayBackController wavesurfer={wavesurfer} />
      <TimeController />
      <MarkerSwitch />
    </>
  );
};

export default ControlBar;
