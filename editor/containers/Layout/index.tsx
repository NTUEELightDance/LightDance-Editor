import { useMemo, useContext } from "react";
import FlexLayout, { TabNode, IJsonModel } from "flexlayout-react";
import { layoutContext } from "types/layout";

// config
import "flexlayout-react/style/dark.css";
import "./layout.css";
// components
import Simulator from "../../components/Simulator";
import Wavesurfer from "../../components/Wavesurfer";
import LightPresets from "../../components/Presets/LightPresets";
import PosPresets from "../../components/Presets/PosPresets";
import EffectList from "../../components/EffectList";
import LightEditor from "../../components/LightEditor";
import PosEditor from "../../components/PosEditor";
import CommandCenter from "../../components/CommandCenter";
import ThreeSimulator from "../../components/ThreeSimulator";

import { LayoutContext } from "contexts/LayoutContext";

import editorConfig from "layouts/editor.json";
import legacyEditorConfig from "layouts/legacyEditor.json";
import mirroredEditorConfig from "layouts/mirroredEditor.json";
import commandConfig from "layouts/commandCenter.json";
import File from "components/Settings/File";

const Layout = () => {
  const { preferedEditor, mode } = useContext(LayoutContext) as layoutContext;

  const CommandCenterNode = useMemo<JSX.Element>(() => <CommandCenter />, []);
  const SimulatorNode = useMemo<JSX.Element>(() => <Simulator />, []);
  const ThreeSimulatorNode = useMemo<JSX.Element>(() => <ThreeSimulator />, []);
  const LightEditorNode = useMemo<JSX.Element>(() => <LightEditor />, []);
  const PosEditorNode = useMemo<JSX.Element>(() => <PosEditor />, []);
  const LightPresetsNode = useMemo<JSX.Element>(() => <LightPresets />, []);
  const PosPresetsNode = useMemo<JSX.Element>(() => <PosPresets />, []);
  const EffectListNode = useMemo<JSX.Element>(() => <EffectList />, []);
  const WavesurferNode = useMemo<JSX.Element>(() => <Wavesurfer />, []);
  const WaveSuferCleanNode = useMemo<JSX.Element>(
    () => <Wavesurfer cleanMode />,
    []
  );
  const FileNode = useMemo<JSX.Element>(() => <File />, []);

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
      case "EffectList":
        return EffectListNode;
      case "Wavesurfer":
        return WavesurferNode;
      case "WavesurferClean":
        return WaveSuferCleanNode;
      case "File":
        return FileNode;
      default:
        return null;
    }
  };

  const EditorNode = useMemo(() => {
    const configFile =
      preferedEditor === "default"
        ? editorConfig
        : preferedEditor === "legacy"
        ? legacyEditorConfig
        : mirroredEditorConfig;
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
