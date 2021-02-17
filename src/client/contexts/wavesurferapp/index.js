import React, { useState, useEffect, createContext } from "react";
import WaveSurferApp from "./waveSurferApp";

const WaveSurferAppContext = createContext(null);
export { WaveSurferAppContext };

// eslint-disable-next-line react/prop-types
export default ({ children }) => {
  const [waveSurferApp, setWaveSurferApp] = useState(null);

  useEffect(() => {
    const newWaveSurferApp = new WaveSurferApp();
    newWaveSurferApp.init();
    setWaveSurferApp(newWaveSurferApp);
  }, []);

  return (
    <WaveSurferAppContext.Provider value={waveSurferApp}>
      {children}
    </WaveSurferAppContext.Provider>
  );
};
