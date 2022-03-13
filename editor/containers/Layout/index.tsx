import { useMemo } from "react";
import FlexLayout, { TabNode, IJsonModel } from "flexlayout-react";

// config
import "flexlayout-react/style/dark.css";
import "./layout.css";
// components
import Simulator from "components/Simulator";
import Wavesurfer from "components/Wavesurfer";
import LightPresets from "components/Presets/LightPresets";
import PosPresets from "components/Presets/PosPresets";
import EffectList from "components/EffectList";
import LightEditor from "components/LightEditor";
import FrameList from "components/FrameList";
import CommandCenter from "components/CommandCenter";
import ThreeSimulator from "components/ThreeSimulator";
import File from "components/Settings/File";
import DancerTree from "components/DancerTree";
import LightProps from "components/LightProps";
import ColorPalette from "components/ColorPalette";

import { useLayout } from "contexts/LayoutContext";

import configFiles from "layouts";

const Layout = () => {
  const {
    preferences: { editor, mode },
  } = useLayout();

  const CommandCenterNode = useMemo<JSX.Element>(() => <CommandCenter />, []);
  const SimulatorNode = useMemo<JSX.Element>(() => <Simulator />, []);
  const ThreeSimulatorNode = useMemo<JSX.Element>(() => <ThreeSimulator />, []);
  const LightEditorNode = useMemo<JSX.Element>(() => <LightEditor />, []);
  const FrameListNode = useMemo<JSX.Element>(() => <FrameList />, []);
  const DancerTreeNode = useMemo<JSX.Element>(() => <DancerTree />, []);
  const LightPropsNode = useMemo<JSX.Element>(() => <LightProps />, []);
  const LightPresetsNode = useMemo<JSX.Element>(() => <LightPresets />, []);
  const PosPresetsNode = useMemo<JSX.Element>(() => <PosPresets />, []);
  const EffectListNode = useMemo<JSX.Element>(() => <EffectList />, []);
  const WavesurferNode = useMemo<JSX.Element>(() => <Wavesurfer />, []);
  const ColorPaletteNode = useMemo<JSX.Element>(() => <ColorPalette />, []);
  const FileNode = useMemo<JSX.Element>(() => <File />, []);

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case "ColorPalette":
        return ColorPaletteNode;
      case "CommandCenter":
        return CommandCenterNode;
      case "Simulator":
        return SimulatorNode;
      case "ThreeSimulator":
        return ThreeSimulatorNode;
      case "LightEditor":
        return LightEditorNode;
      case "FrameList":
        return FrameListNode;
      case "DancerTree":
        return DancerTreeNode;
      case "LightProps":
        return LightPropsNode;
      case "LightPresets":
        return LightPresetsNode;
      case "PosPresets":
        return PosPresetsNode;
      case "EffectList":
        return EffectListNode;
      case "Wavesurfer":
        return WavesurferNode;
      case "File":
        return FileNode;
      default:
        return null;
    }
  };

  const EditorNode = useMemo(() => {
    return (
      <FlexLayout.Layout
        model={FlexLayout.Model.fromJson(configFiles[editor] as IJsonModel)}
        factory={factory}
        font={{ size: "12px" }}
      />
    );
  }, [editor]);

  const CommandNode = useMemo(() => {
    return (
      <FlexLayout.Layout
        model={FlexLayout.Model.fromJson(configFiles["command"] as IJsonModel)}
        factory={factory}
        font={{ size: "12px" }}
      />
    );
  }, []);

  return <>{mode === "editor" ? EditorNode : CommandNode}</>;
};

export default Layout;
