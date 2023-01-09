import type { TabNode, IJsonModel } from "flexlayout-react";

import { lazy, Suspense, useMemo, LazyExoticComponent } from "react";

import {
  Layout as FlexLayout,
  Model as FlexLayoutModel,
} from "flexlayout-react";

import "flexlayout-react/style/dark.css";
import "./layout.css";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import configFiles from "layouts";

const CommandCenter = lazy(() => import("components/CommandCenter"));
const ThreeSimulator = lazy(() => import("components/ThreeSimulator"));
const FrameList = lazy(() => import("components/FrameList"));
const DancerTree = lazy(() => import("components/DancerTree"));
const LightProps = lazy(() => import("components/LightProps"));
const LightPresets = lazy(() => import("components/Presets/LightPresets"));
const PosPresets = lazy(() => import("components/Presets/PosPresets"));
const EffectList = lazy(() => import("components/EffectList"));
const Wavesurfer = lazy(() => import("components/Wavesurfer"));
const ColorPalette = lazy(() => import("components/ColorPalette"));
const File = lazy(() => import("components/Settings/File"));

const NotFound = lazy(() => import("components/NotFound"));

const componentMap = {
  ColorPalette: ColorPalette,
  CommandCenter: CommandCenter,
  ThreeSimulator: ThreeSimulator,
  FrameList: FrameList,
  DancerTree: DancerTree,
  LightProps: LightProps,
  LightPresets: LightPresets,
  PosPresets: PosPresets,
  EffectList: EffectList,
  Wavesurfer: Wavesurfer,
  File: File,
};

type ComponentMap = typeof componentMap;

const factory = (node: TabNode) => {
  const component = node.getComponent() as keyof ComponentMap;
  const Component: LazyExoticComponent<(props: any) => JSX.Element> =
    componentMap[component] ?? NotFound;
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      {Component ? <Component /> : null}
    </Suspense>
  );
};

export interface LayoutProps {
  mode: keyof typeof configFiles;
}

function Layout({ mode }: LayoutProps) {
  const layoutModel = useMemo(
    () => FlexLayoutModel.fromJson(configFiles[mode] as IJsonModel),
    [mode]
  );

  // @ts-ignore
  return <FlexLayout model={layoutModel} factory={factory} />;
}

export default Layout;
