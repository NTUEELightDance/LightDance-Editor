import * as THREE from "three";

import type { LEDPartData } from "@/core/models";
import Part from "./Part";
import { hexToRGB } from "@/core/utils/convert";

const vertexShader = `
uniform float size;
attribute vec3 color;
attribute float alpha;
varying vec4 vColor;

void main() {
  vColor = vec4( color, alpha );
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  // calculate depth
  float distance = length( mvPosition.xyz );
  // scale up with the distance
  gl_PointSize = size * ( 100.0 / distance );
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform sampler2D pointTexture;
varying vec4 vColor;

void main() {
  // apply texture to make the point round
  gl_FragColor = vColor * texture2D( pointTexture, gl_PointCoord );
}
`;

const defaultDisplay = {
  colorCode: "#000000",
  alpha: 255,
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

    const alphas = [];
    for (let i = 0; i < LEDpositions.length; i++) {
      alphas.push(defaultDisplay.alpha / 15);
    }
    this.geometry.setAttribute(
      "alpha",
      new THREE.Float32BufferAttribute(alphas, 1)
    );

    const material = new THREE.ShaderMaterial({
      uniforms: {
        size: { value: 1 },
        pointTexture: {
          value: new THREE.TextureLoader().load("/asset/textures/particle.png"),
        },
      },
      vertexShader,
      fragmentShader,
      // enable alpha blending
      transparent: true,
      // to avoid LEDs from covering each other
      depthWrite: false,
    });

    this.LEDs = new THREE.Points(this.geometry, material);
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
      const { colorCode, alpha } = display || defaultDisplay;
      colorAttribute.setXYZ(i, ...hexToRGB(colorCode));
      alphaAttribute.setX(i, (alpha / 10) * (statusAlpha / 15));
    });
    colorAttribute.needsUpdate = true;
    alphaAttribute.needsUpdate = true;
  }
}
