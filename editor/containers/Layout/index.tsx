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
import File from "components/Settings/File";
import DancerList from "components/DancerList";
import LightProps from "components/LightProps";

import { Box } from "@mui/material";

import { LayoutContext } from "contexts/LayoutContext";

import {
  betaConfig,
  defaultEditorConfig,
  mirroredEditorConfig,
  legacyEditorConfig,
  commandCenterConfig,
} from "layouts";

const Layout = () => {
  const { preferedEditor, mode } = useContext(LayoutContext) as layoutContext;

  const CommandCenterNode = useMemo<JSX.Element>(() => <CommandCenter />, []);
  const SimulatorNode = useMemo<JSX.Element>(() => <Simulator />, []);
  const ThreeSimulatorNode = useMemo<JSX.Element>(() => <ThreeSimulator />, []);
  const LightEditorNode = useMemo<JSX.Element>(() => <LightEditor />, []);
  const PosEditorNode = useMemo<JSX.Element>(() => <PosEditor />, []);
  const DancerListNode = useMemo<JSX.Element>(() => <DancerList />, []);
  const LightPropsNode = useMemo<JSX.Element>(() => <LightProps />, []);
  const LightPresetsNode = useMemo<JSX.Element>(() => <LightPresets />, []);
  const PosPresetsNode = useMemo<JSX.Element>(() => <PosPresets />, []);
  const EffectListNode = useMemo<JSX.Element>(() => <EffectList />, []);
  const WavesurferNode = useMemo<JSX.Element>(() => <Wavesurfer />, []);
  const WaveSuferCleanNode = useMemo<JSX.Element>(
    () => <Wavesurfer cleanMode />,
    []
  );
  const FileNode = useMemo<JSX.Element>(
    () => (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          p: "5% 8%",
        }}
      >
        <File />
      </Box>
    ),
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
      case "DancerList":
        return DancerListNode;
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
      preferedEditor === "mirrored"
        ? mirroredEditorConfig
        : preferedEditor === "legacy"
        ? legacyEditorConfig
        : preferedEditor === "beta"
        ? betaConfig
        : defaultEditorConfig;
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
        model={FlexLayout.Model.fromJson(commandCenterConfig as IJsonModel)}
        factory={factory}
        font={{ size: "12px" }}
      />
    );
  }, []);

  const LayoutNode = mode === "editor" ? EditorNode : CommandNode;

  return <>{LayoutNode}</>;
};

export default Layout;
