import React, { useLayoutEffect } from "react";
// my-class
import controller from "./Controller";

/**
 * This is Display component
 * @component
 */
const Simulator: React.FC = ({}) => {
  useLayoutEffect(() => {
    controller.init();
  }, []);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <div
        id="pixi"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div id="main_stage" />
      </div>
    </div>
  );
};
export default Simulator;
