import { GUI } from "three/examples/jsm/libs/lil-gui.module.min";
// GUI to control behavior of three simulator

import { LED, FIBER } from "constants";

class Settings {
  constructor(threeController) {
    this.threeController = threeController;
    this.panel = new GUI();

    this.settings = {
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
    const { panel, settings, threeController } = this;
    const folder1 = panel.addFolder("Visibility");
    const folder2 = panel.addFolder("Light");

    folder1.add(settings["Visibility"], "LED").onChange((value: any) => {
      settings["Visibility"]["LED"] = value;
      const { dancers } = threeController;
      Object.values(dancers).forEach((dancer) => {
        Object.values(dancer.parts[LED]).forEach((part) => {
          part.meshes.forEach((mesh) => {
            mesh.visible = value;
          });
        });
      });
    });

    folder1.add(settings["Visibility"], "FIBER").onChange((value: any) => {
      settings["Visibility"]["FIBER"] = value;
      const { dancers } = threeController;
      Object.values(dancers).forEach((dancer) => {
        Object.values(dancer.parts[FIBER]).forEach((part) => {
          part.mesh.visible = value;
        });
      });
    });

    folder1
      .add(settings["Visibility"], "Grid Helper")
      .onChange((value: any) => {
        settings["Visibility"]["Grid Helper"] = value;
        const { gridHelper } = threeController;
        gridHelper.visible = value;
      });

    folder1.add(settings["Visibility"], "Center").onChange((value: any) => {
      settings["Visibility"]["Center"] = value;
      const { scene } = threeController;
      scene.getObjectByName("Center").visible = value;
    });

    folder1.add(settings["Visibility"], "Name Tag").onChange((value: any) => {
      settings["Visibility"]["Name Tag"] = value;
      const { dancers } = threeController;
      Object.values(dancers).forEach((dancer) => {
        dancer.nameTag.visible = value;
      });
    });

    folder2
      .add(settings["Light"], "intensity", 0.0, 10.0, 0.5)
      .onChange((value: any) => {
        settings["Light"]["intensity"] = value;
        const { light } = threeController;
        light.intensity = value;
      });

    folder2
      .add(settings["Light"], "x", -10.0, 10.0, 1.0)
      .onChange((value: any) => {
        settings["Light"]["x"] = value;
        const { light } = threeController;
        light.position.setX(value);
      });

    folder2
      .add(settings["Light"], "y", -10.0, 10.0, 1.0)
      .onChange((value: any) => {
        settings["Light"]["y"] = value;
        const { light } = threeController;
        light.position.setY(value);
      });

    folder2
      .add(settings["Light"], "z", -10.0, 10.0, 1.0)
      .onChange((value: any) => {
        settings["Light"]["z"] = value;
        const { light } = threeController;
        light.position.setZ(value);
      });
  }
}

export default Settings;
