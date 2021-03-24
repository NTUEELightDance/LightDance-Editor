import React, { useState, createContext } from "react";

export const WaveSurferAppContext = createContext(null);
// export { WebSocketContext };

export default function WaveSurfer({ children }) {
  const [waveSurferApp, setWaveSurferApp] = useState(null);
  const initWaveSurferApp = (wave) => {
    setWaveSurferApp(wave);
  };

  return (
    <WaveSurferAppContext.Provider value={{ waveSurferApp, initWaveSurferApp }}>
      {children}
    </WaveSurferAppContext.Provider>
  );
}
