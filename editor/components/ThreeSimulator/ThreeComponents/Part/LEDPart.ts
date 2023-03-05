import * as THREE from "three";

import type { LEDPartData } from "@/core/models";
import Part from "./Part";
import { hexToRGB } from "@/core/utils/convert";

const vertexShader = `
uniform float size;
attribute vec3 color;
attribute float alpha;
attribute float selected; // 0 or 1
varying vec4 vColor;
varying float vSelected;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  // calculate depth
  float distanceToCamera = length( mvPosition.xyz );

  // scale up with the distanceToCamera
  gl_PointSize = size * ( 100.0 / distanceToCamera );
  gl_Position = projectionMatrix * mvPosition;

  vColor = vec4( color, alpha * 0.9 ); // 0.9 for the ring that indicates selected to pop
  vSelected = selected;
}
`;

const fragmentShader = `
varying vec4 vColor;
varying float vSelected;

void main() {
  // calculate distance to the center of the texture
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5, 0.5));

  if (distanceToCenter > 0.5) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else if(distanceToCenter > 0.45) {
    // selected indicator
    gl_FragColor = vec4(1.0, 1.0, 1.0, vSelected);
  } else {
    gl_FragColor = vColor;
  }
}
`;

const defaultDisplay = {
  colorCode: "#000000",
  alpha: 0,
};

export default class LEDPart extends Part {
  LEDs: THREE.Points;
  geometry: THREE.BufferGeometry;

  constructor(name: string, model: THREE.Object3D) {
    super(name, model);

    this.LEDs = new THREE.Points();
    this.geometry = new THREE.BufferGeometry();
    this.createLEDs();
  }

  createLEDs() {
    const LEDpositions = [];
    for (let i = 1; ; i++) {
      // while(true) will cause Unexpected constant condition
      const name = `${this.name}${String(i).padStart(3, "0")}`;
      const mesh = this.model.getObjectByName(name);
      if (mesh == null) break;
      mesh.visible = false;
      LEDpositions.push(mesh.position.clone());
    }

    this.geometry = new THREE.BufferGeometry().setFromPoints(LEDpositions);

    const colors = [];
    const rgb = hexToRGB(defaultDisplay.colorCode);
    for (let i = 0; i < LEDpositions.length; i++) {
      colors.push(...rgb);
    }
    this.geometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );

    const alphas = Array(LEDpositions.length).fill(defaultDisplay.alpha / 15);
    this.geometry.setAttribute(
      "alpha",
      new THREE.Float32BufferAttribute(alphas, 1)
    );

    const selected = Array(LEDpositions.length).fill(0);
    this.geometry.setAttribute(
      "selected",
      new THREE.Float32BufferAttribute(selected, 1)
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        size: { value: 1 },
      },
      vertexShader,
      fragmentShader,
      // enable alpha blending
      transparent: true,
      // to avoid LEDs from covering each other
      depthWrite: false,
    });

    this.LEDs = new THREE.Points(this.geometry, material);
    this.LEDs.name = this.name;
  }

  setVisibility(visible: boolean) {
    this.visible = visible;
    this.LEDs.visible = visible;
  }

  setStatus(status: LEDPartData) {
    if (!this.visible) return;

    const { effect, alpha: statusAlpha } = status;
    const colorAttribute = this.geometry.getAttribute(
      "color"
    ) as THREE.BufferAttribute;
    const alphaAttribute = this.geometry.getAttribute(
      "alpha"
    ) as THREE.BufferAttribute;

    effect.forEach((display, i) => {
      const { colorCode, alpha } = display;
      colorAttribute.setXYZ(i, ...hexToRGB(colorCode));
      alphaAttribute.setX(i, (alpha / 10) * (statusAlpha / 15));
    });

    colorAttribute.needsUpdate = true;
    alphaAttribute.needsUpdate = true;
  }

  setSelected(selectedLEDs: number[]) {
    const selectedAttribute = this.geometry.getAttribute(
      "selected"
    ) as THREE.BufferAttribute;

    for (let i = 0; i < selectedAttribute.count; i++) {
      selectedAttribute.setX(i, 0);
    }

    selectedLEDs.forEach((i) => {
      selectedAttribute.setX(i, 1);
    });

    selectedAttribute.needsUpdate = true;
  }

  select() {
    const selectedAttribute = this.geometry.getAttribute(
      "selected"
    ) as THREE.BufferAttribute;

    for (let i = 0; i < selectedAttribute.count; i++) {
      selectedAttribute.setX(i, 1);
    }

    selectedAttribute.needsUpdate = true;
  }

  deselect() {
    this.setSelected([]);
  }
}
