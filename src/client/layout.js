import React from "react";
import FlexLayout from "flexlayout-react";
// config
import "flexlayout-react/style/dark.css";
import "./layout.css";

import layoutConfig from "./layoutConfig.json";
// components
import Simulator from "./components/simulator";
import Wavesurfer from "./components/wavesurfer";
import Preset from "./components/preset";
import LightEditor from "./components/lightEditor";
import PosEditor from "./components/posEditor";

export default function Layout() {
  // layout
  const factory = (node) => {
    const component = node.getComponent();
    switch (component) {
      case "Simulator":
        return <Simulator />;
      case "LightEditor":
        return <LightEditor />;
      case "PosEditor":
        return <PosEditor />;
      case "Wavesurfer":
        return <Wavesurfer />;
      case "Preset":
        return <Preset />;
      default:
        return null;
    }
  };
  return (
    <FlexLayout.Layout
      model={FlexLayout.Model.fromJson(layoutConfig)}
      factory={factory}
    />
  );
}
