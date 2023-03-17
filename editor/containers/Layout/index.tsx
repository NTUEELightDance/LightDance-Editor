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
import useLayout from "hooks/useLayout";

const CommandCenter = lazy(
  async () => await import("@/components/CommandCenter")
);
const ThreeSimulator = lazy(
  async () => await import("@/components/ThreeSimulator")
);
const FrameList = lazy(async () => await import("@/components/FrameList"));
const Objects = lazy(async () => await import("@/components/ObjectsPanel"));
const LightProps = lazy(async () => await import("@/components/LightProps"));
const LightPresets = lazy(
  async () => await import("@/components/Presets/LightPresets")
);
const PosPresets = lazy(
  async () => await import("@/components/Presets/PosPresets")
);
const EffectList = lazy(async () => await import("@/components/EffectList"));
const LEDEffectList = lazy(
  async () => await import("@/components/LEDEffectList")
);
const Wavesurfer = lazy(async () => await import("@/components/Wavesurfer"));
const ColorPalette = lazy(
  async () => await import("@/components/ColorPalette")
);
const WebShell = lazy(async () => await import("@/components/WebShell"));

const NotFound = lazy(async () => await import("@/components/NotFound"));

const componentMap = {
  ColorPalette,
  CommandCenter,
  ThreeSimulator,
  FrameList,
  Objects,
  LightProps,
  LightPresets,
  PosPresets,
  EffectList,
  LEDEffectList,
  Wavesurfer,
  WebShell,
};

type ComponentMap = typeof componentMap;

const factory = (node: TabNode) => {
  const component = node.getComponent() as keyof ComponentMap;
  const Component: LazyExoticComponent<(props: unknown) => JSX.Element> =
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
  const { layout } = useLayout();
  const layoutModel = useMemo(() => {
    if (layout === "default")
      return FlexLayoutModel.fromJson(configFiles[mode] as IJsonModel);
    else {
      const customLayout = window.localStorage.getItem("customLayout");
      if (customLayout) {
        return FlexLayoutModel.fromJson(JSON.parse(customLayout) as IJsonModel);
      }
      // If custom layout is not found, return default layout
      return FlexLayoutModel.fromJson(configFiles[mode] as IJsonModel);
    }
  }, [mode, layout]);
  return (
    <FlexLayout
      model={layoutModel}
      factory={factory}
      onModelChange={(model) => {
        window.localStorage.setItem(
          "customLayout",
          JSON.stringify(model.toJson())
        );
      }}
    />
  );
}

export default Layout;
