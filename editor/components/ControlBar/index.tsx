import { useContext } from "react";

import PlayBackController from "./PlayBackController";
import TimeController from "./TimeController";
import WaveSurferApp from "../Wavesurfer/WaveSurferApp";
import VolumeSlider from "./VolumeSlider";
import ScaleSlider from "./ScaleSlider";
import FadeSwitch from "./FadeSwitch";
import useMode from "@/hooks/useMode";

const ControlBar = ({ wavesurfer }: { wavesurfer: WaveSurferApp }) => {
  const mode = useMode();
  
  return (
    <>
      <PlayBackController wavesurfer={wavesurfer} />
      <TimeController />
      {mode === "editor" && <FadeSwitch />}
      <VolumeSlider wavesurfer={wavesurfer} />
      <ScaleSlider wavesurfer={wavesurfer} />
    </>
  );
};

export default ControlBar;
