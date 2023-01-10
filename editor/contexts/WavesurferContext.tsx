import { useState, createContext, useRef } from "react";
import WaveSurferApp, {
  waveSurferAppInstance
} from "components/Wavesurfer/WaveSurferApp";
import { wavesurferContext } from "types/components/wavesurfer";

export const WaveSurferAppContext = createContext<wavesurferContext | null>(
  null
);

export default function WaveSurfer ({ children }: { children: JSX.Element }) {
  const waveSurferApp = useRef<WaveSurferApp>(waveSurferAppInstance);
  const [showMarkers, setShowMarkers] = useState(true);
  const toggleMarkers = () => {
    setShowMarkers(!showMarkers);
  };
  const initWaveSurferApp = () => {
    waveSurferApp.current.init();
  };

  return (
    <WaveSurferAppContext.Provider
      value={{
        waveSurferApp: waveSurferApp.current,
        showMarkers,
        initWaveSurferApp,
        toggleMarkers
      }}
    >
      {children}
    </WaveSurferAppContext.Provider>
  );
}
