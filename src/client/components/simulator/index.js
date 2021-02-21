import React, { useState, useEffect } from "react";
import Scrollbars from "react-custom-scrollbars";
// redux
import { useSelector } from "react-redux";
// actions
import { selectGlobal } from "../../slices/globalSlice";
// my-class
import Controller from "./controller";
// useSelector

/**
 * This is Display component
 *
 * @component
 */

export default function Simulator() {
  const { currentStatus, currentPos } = useSelector(selectGlobal);
  const [controller, setController] = useState(null);

  useEffect(() => {
    const newController = new Controller();
    newController.init();
    setController(newController);
  }, []);

  useEffect(() => {
    if (controller) {
      controller.updateDancersStatus(currentStatus);
    }
  }, [controller, currentStatus]);

  useEffect(() => {
    if (controller) {
      controller.updateDancersPos(currentPos);
    }
  }, [controller, currentPos]);

  // scroll bar config
  const renderThumb = ({ style, ...props }) => {
    const thumbStyle = {
      borderRadius: 6,
      backgroundColor: "rgba(192,192,200, 0.5)",
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Scrollbars
        renderThumbVertical={renderThumb}
        renderThumbHorizontal={renderThumb}
      >
        <div id="main_stage" />
      </Scrollbars>
    </div>
  );
}
