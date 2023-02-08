// @ts-expect-error for importing GUI
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
// GUI to control behavior of three simulator

import ThreeController from "../ThreeController";
import { LED, FIBER } from "@/constants";

interface SettingsConfig {
  Visibility: {
    LED: boolean;
    FIBER: boolean;
    "Grid Helper": boolean;
    Center: boolean;
    "Name Tag": boolean;
  };
  Light: {
    intensity: number;
    x: number;
    y: number;
    z: number;
  };
}
class Settings {
  threeController: ThreeController;
  panel: GUI;
  config: SettingsConfig;

  constructor(threeController: ThreeController) {
    this.threeController = threeController;
    this.panel = new GUI();

    this.config = {
      Visibility: {
        LED: false,
        FIBER: true,
        "Grid Helper": true,
        Center: true,
        "Name Tag": true,
      },
      Light: {
        intensity: 1.0,
        x: 0.0,
        y: 0.0,
        z: 0.0,
      },
    };

    this.initGUI();
    this.panel.close();
  }

  initGUI() {
    // gui to change paramters including color, positon, controlls
    const { panel, config, threeController } = this;
    const visibilityFolder = panel.addFolder("Visibility");
    const lightFolder = panel.addFolder("Light");

    visibilityFolder
      .add(config.Visibility, "LED")
      .onChange((value: boolean) => {
        config.Visibility.LED = value;
        const { dancers } = threeController;
        Object.values(dancers).forEach((dancer) => {
          Object.values(dancer.parts[LED]).forEach((part) => {
            part.setVisibility(value);
          });
        });
      });

    visibilityFolder
      .add(config.Visibility, "FIBER")
      .onChange((value: boolean) => {
        config.Visibility.FIBER = value;
        const { dancers } = threeController;
        Object.values(dancers).forEach((dancer) => {
          Object.values(dancer.parts[FIBER]).forEach((part) => {
            part.setVisibility(value);
          });
        });
      });

    visibilityFolder
      .add(config.Visibility, "Grid Helper")
      .onChange((value: boolean) => {
        config.Visibility["Grid Helper"] = value;
        const { gridHelper } = threeController;
        gridHelper.visible = value;
      });

    visibilityFolder
      .add(config.Visibility, "Center")
      .onChange((value: boolean) => {
        config.Visibility.Center = value;
        const { scene } = threeController;
        (scene.getObjectByName("Center") as THREE.Mesh).visible = value;
      });

    visibilityFolder
      .add(config.Visibility, "Name Tag")
      .onChange((value: boolean) => {
        config.Visibility["Name Tag"] = value;
        const { dancers } = threeController;
        Object.values(dancers).forEach((dancer) => {
          dancer.nameTag.visible = value;
        });
      });

    lightFolder
      .add(config.Light, "intensity", 0.0, 10.0, 0.5)
      .onChange((value: number) => {
        config.Light.intensity = value;
        const { light } = threeController;
        light.intensity = value;
      });

    lightFolder
      .add(config.Light, "x", -10.0, 10.0, 1.0)
      .onChange((value: number) => {
        config.Light.x = value;
        const { light } = threeController;
        light.position.setX(value);
      });

    lightFolder
      .add(config.Light, "y", -10.0, 10.0, 1.0)
      .onChange((value: number) => {
        config.Light.y = value;
        const { light } = threeController;
        light.position.setY(value);
      });

    lightFolder
      .add(config.Light, "z", -10.0, 10.0, 1.0)
      .onChange((value: number) => {
        config.Light.z = value;
        const { light } = threeController;
        light.position.setZ(value);
      });
  }
}

export default Settings;
