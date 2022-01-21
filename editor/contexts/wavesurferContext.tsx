import React, { useState, createContext } from "react";
import WaveSurferApp from "components/wavesurfer/waveSurferApp";
import { wavesurferContext } from "types/components/wavesurfer";

export const WaveSurferAppContext = createContext<wavesurferContext | null>(null);
// export { WebSocketContext };

export default function WaveSurfer({ children }: any) {
  const [waveSurferApp, setWaveSurferApp] = useState<WaveSurferApp | null>(null);
  const [markersToggle, toggleMarkers] = useState(true);
  const initWaveSurferApp = (wave: WaveSurferApp ) => {
    setWaveSurferApp(wave);
  };

  return (
    <WaveSurferAppContext.Provider value={{ waveSurferApp, markersToggle, initWaveSurferApp, toggleMarkers }}>
      {children}
    </WaveSurferAppContext.Provider>
  );
}
