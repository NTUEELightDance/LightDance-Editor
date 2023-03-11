import * as THREE from "three";

import type { LEDPartData } from "@/core/models";
import Part from "./Part";
import { hexToRGB } from "@/core/utils/convert";
import { state } from "@/core/state";

const vertexShader = `
uniform float size;
attribute vec3 color;
attribute float alpha;
attribute float selected; // 0 or 1
attribute float focused; // all 0 or all 1
varying vec4 vColor;
varying float vSelected;
varying float vFocused;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  // calculate depth
  float distanceToCamera = length( mvPosition.xyz );

  // scale up with the distanceToCamera
  gl_PointSize = size * ( 100.0 / distanceToCamera );
  gl_Position = projectionMatrix * mvPosition;

  vColor = vec4( color, alpha * 0.9 ); // 0.9 for the ring that indicates selected to pop
  vSelected = selected;
  vFocused = focused;
}
`;

const fragmentShader = `
varying vec4 vColor;
varying float vSelected;
varying float vFocused;

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

    // if focused, and the alpha is 0, then add white color
    if (vFocused > 0.0 && vColor.a == 0.0) {
      gl_FragColor = mix(gl_FragColor, vec4(1.0, 1.0, 1.0, 0.2), vFocused);
    }
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
  position: THREE.Vector3;
  isSelected: boolean;
  isFocused: boolean;

  constructor(name: string, model: THREE.Object3D) {
    super(name, model);

    this.LEDs = new THREE.Points();
    this.geometry = new THREE.BufferGeometry();
    this.position = new THREE.Vector3();
    this.isSelected = false;
    this.isFocused = false;
    this.createLEDs();
  }

  createLEDs() {
    const LEDpositions = [];
    for (let i = 1; ; i++) {
      const name = `${this.name}${String(i).padStart(3, "0")}`;
      const mesh = this.model.getObjectByName(name);
      if (mesh == null) break;
      mesh.visible = false;
      LEDpositions.push(mesh.position.clone());
    }

    // calculate mean position
    LEDpositions.forEach((p) => {
      this.position.add(p);
    });
    this.position.divideScalar(LEDpositions.length);

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

    const focused = Array(LEDpositions.length).fill(0);
    this.geometry.setAttribute(
      "focused",
      new THREE.Float32BufferAttribute(focused, 1)
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
      const { colorID, alpha } = display;
      const rgb = state.colorMap[colorID].rgb;
      colorAttribute.setXYZ(i, rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
      alphaAttribute.setX(i, (alpha / 10) * (statusAlpha / 15));
    });

    colorAttribute.needsUpdate = true;
    alphaAttribute.needsUpdate = true;
  }

  setSelectedLEDBulbs(selectedLEDs: number[]) {
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
    if (this.isSelected) return;

    const selectedAttribute = this.geometry.getAttribute(
      "selected"
    ) as THREE.BufferAttribute;

    for (let i = 0; i < selectedAttribute.count; i++) {
      selectedAttribute.setX(i, 1);
    }

    selectedAttribute.needsUpdate = true;
    this.isSelected = true;
  }

  deselect() {
    if (!this.isSelected) return;

    this.setSelectedLEDBulbs([]);
    this.isSelected = false;
  }

  focus() {
    if (this.isFocused) return;

    const focusedAttribute = this.geometry.getAttribute(
      "focused"
    ) as THREE.BufferAttribute;

    for (let i = 0; i < focusedAttribute.count; i++) {
      focusedAttribute.setX(i, 1);
    }

    focusedAttribute.needsUpdate = true;
    this.isFocused = true;
  }

  unfocus() {
    if (!this.isFocused) return;

    const focusedAttribute = this.geometry.getAttribute(
      "focused"
    ) as THREE.BufferAttribute;

    for (let i = 0; i < focusedAttribute.count; i++) {
      focusedAttribute.setX(i, 0);
    }

    focusedAttribute.needsUpdate = true;
    this.isFocused = false;
  }
}
