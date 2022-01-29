import FlexLayout, { TabNode } from "flexlayout-react";
// config
import "flexlayout-react/style/dark.css";
import "./layout.css";
// import layoutConfig from "./layouts/editor.json";
import layoutConfig from "./layouts/commandCenter.json";
// components
import Simulator from "./components/Simulator";
import Wavesurfer from "./components/Wavesurfer";
import LightPresets from "./components/Presets/LightPresets";
import PosPresets from "./components/Presets/PosPresets";
import EffectList from "./components/EffectList";
import LightEditor from "./components/LightEditor";
import PosEditor from "./components/PosEditor";
import File from "./components/File";
import CommandCenter from "./components/CommandCenter";
import ThreeSimulator from "./components/ThreeSimulator";

export default function Layout() {
  // layout
  const factory = (node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case "CommandCenter":
        return <CommandCenter />;
      case "Simulator":
        return <Simulator />;
      case "ThreeSimulator":
        return <ThreeSimulator />;
      case "LightEditor":
        return <LightEditor />;
      case "PosEditor":
        return <PosEditor />;
      case "Wavesurfer":
        return <Wavesurfer />;
      case "WavesurferClean":
        return <Wavesurfer cleanMode />;
      case "LightPresets":
        return <LightPresets />;
      case "PosPresets":
        return <PosPresets />;
      case "EffectList":
        return <EffectList />;
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
      font={{ size: "12px" }}
    />
  );
}
