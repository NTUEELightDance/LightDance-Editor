import { useState, createContext, useRef } from "react";
import WaveSurferApp, {
  waveSurferAppInstance,
} from "components/Wavesurfer/WaveSurferApp";

export interface WavesurferContextType {
  waveSurferApp: WaveSurferApp;
  showMarkers: boolean;
  initWaveSurferApp: () => void;
  toggleMarkers: () => void;
}

export const WaveSurferAppContext = createContext<WavesurferContextType | null>(
  null
);

export default function WaveSurfer({ children }: { children: JSX.Element }) {
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
        toggleMarkers,
      }}
    >
      {children}
    </WaveSurferAppContext.Provider>
  );
}
