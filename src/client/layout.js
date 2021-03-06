import React from "react";
import FlexLayout from "flexlayout-react";
// config
import "flexlayout-react/style/dark.css";
import "./layout.css";
import layoutConfig from "./layoutConfig.json";
// components
import Simulator from "./components/simulator";
import Wavesurfer from "./components/wavesurfer";
import LightPresets from "./components/presets/lightPresets";
import PosPresets from "./components/presets/posPresets";
import LightEditor from "./components/lightEditor";
import PosEditor from "./components/posEditor";
import File from "./components/file";
import CommandCenter from "./components/commandCenter";

export default function Layout() {
  // layout
  const factory = (node) => {
    const component = node.getComponent();
    switch (component) {
      case "CommandCenter":
        return <CommandCenter />;
      case "Simulator":
        return <Simulator />;
      case "LightEditor":
        return <LightEditor />;
      case "PosEditor":
        return <PosEditor />;
      case "Wavesurfer":
        return <Wavesurfer />;
      case "LightPresets":
        return <LightPresets />;
      case "PosPresets":
        return <PosPresets />;
      case "File":
        return <File />;
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
