import React, { useState, useEffect, createContext } from "react";
import Controller from "./controller";

const ControllerContext = createContext(null);
export { ControllerContext };

export default ({ children }) => {
  const [controller, setController] = useState(null);

  useEffect(() => {
    const newController = new Controller();
    newController.init();
    setController(newController);
  }, []);

  return (
    <ControllerContext.Provider value={controller}>
      {children}
    </ControllerContext.Provider>
  );
};
