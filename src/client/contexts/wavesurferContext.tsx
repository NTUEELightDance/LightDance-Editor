import React, { useState, createContext } from "react";

export const WaveSurferAppContext = createContext(null);
// export { WebSocketContext };

export default function WaveSurfer({ children }) {
  const [waveSurferApp, setWaveSurferApp] = useState(null);
  const [markersToggle, toggleMarkers] = useState(true);
  const initWaveSurferApp = (wave) => {
    setWaveSurferApp(wave);
  };

  return (
    <WaveSurferAppContext.Provider value={{ waveSurferApp, markersToggle, initWaveSurferApp, toggleMarkers }}>
      {children}
    </WaveSurferAppContext.Provider>
  );
}
