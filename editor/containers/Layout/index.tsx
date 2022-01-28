import { useMemo, useContext } from "react";
import FlexLayout, { TabNode, IJsonModel } from "flexlayout-react";
import { layoutContext } from "types/layout";

// config
import "flexlayout-react/style/dark.css";
import "./layout.css";
// components
import Simulator from "../../components/simulator";
import Wavesurfer from "../../components/wavesurfer";
import LightPresets from "../../components/presets/lightPresets";
import PosPresets from "../../components/presets/posPresets";
import LightEditor from "../../components/lightEditor";
import PosEditor from "../../components/posEditor";
import CommandCenter from "../../components/commandCenter";
import ThreeSimulator from "../../components/threeSimulator";

import { LayoutContext } from "contexts/layoutContext";

import editorConfig from "layouts/editor.json";
import legacyEditorConfig from "layouts/legacyEditor.json";
import commandConfig from "layouts/commandCenter.json";

const Layout = () => {
  const { preferedEditor, mode } = useContext(LayoutContext) as layoutContext;

  const CommandCenterNode = useMemo<JSX.Element>(() => <CommandCenter />, []);
  const SimulatorNode = useMemo<JSX.Element>(() => <Simulator />, []);
  const ThreeSimulatorNode = useMemo<JSX.Element>(() => <ThreeSimulator />, []);
  const LightEditorNode = useMemo<JSX.Element>(() => <LightEditor />, []);
  const PosEditorNode = useMemo<JSX.Element>(() => <PosEditor />, []);
  const LightPresetsNode = useMemo<JSX.Element>(() => <LightPresets />, []);
  const PosPresetsNode = useMemo<JSX.Element>(() => <PosPresets />, []);
  const WavesurferNode = useMemo<JSX.Element>(() => <Wavesurfer />, []);
  const WaveSuferCleanNode = useMemo<JSX.Element>(
    () => <Wavesurfer cleanMode />,
    []
  );

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case "CommandCenter":
        return CommandCenterNode;
      case "Simulator":
        return SimulatorNode;
      case "ThreeSimulator":
        return ThreeSimulatorNode;
      case "LightEditor":
        return LightEditorNode;
      case "PosEditor":
        return PosEditorNode;
      case "LightPresets":
        return LightPresetsNode;
      case "PosPresets":
        return PosPresetsNode;
      case "Wavesurfer":
        return WavesurferNode;
      case "WavesurferClean":
        return WaveSuferCleanNode;
      default:
        return null;
    }
  };

  const EditorNode = useMemo(() => {
    const configFile =
      preferedEditor === "default" ? editorConfig : legacyEditorConfig;
    return (
      <FlexLayout.Layout
        model={FlexLayout.Model.fromJson(configFile as IJsonModel)}
        factory={factory}
        font={{ size: "12px" }}
      />
    );
  }, [preferedEditor]);

  const CommandNode = useMemo(() => {
    return (
      <FlexLayout.Layout
        // @ts-ignore:next-line
        model={FlexLayout.Model.fromJson(commandConfig as IJsonModel)}
        factory={factory}
        font={{ size: "12px" }}
      />
    );
  }, []);

  const LayoutNode = mode === "editor" ? EditorNode : CommandNode;

  return <>{LayoutNode}</>;
};

export default Layout;
