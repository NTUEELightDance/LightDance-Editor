import { LineSegments } from "three/src/objects/LineSegments.js";
import { LineBasicMaterial } from "three/src/materials/LineBasicMaterial.js";
import { Float32BufferAttribute } from "three/src/core/BufferAttribute.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import { Color } from "three/src/math/Color.js";

class GridHelper extends LineSegments {
  constructor (size = 10, divisions = 10, color1 = 0x444444, color2 = 0x888888) {
    color1 = new Color(color1);
    color2 = new Color(color2);

    const center = divisions / 2;
    const step = size / divisions;
    const halfSize = size / 2;

    const vertices = [];
    const colors = [];

    for (let i = 0, j = 0, k = -halfSize; i <= divisions; i++, k += step) {
      if (i % 2 === 0) vertices.push(-halfSize, 0, k / 2, halfSize, 0, k / 2);
      vertices.push(k, 0, -halfSize / 2, k, 0, halfSize / 2);

      const color = i === center ? color1 : color2;

      color.toArray(colors, j);
      j += 3;
      color.toArray(colors, j);
      j += 3;
      color.toArray(colors, j);
      j += 3;
      color.toArray(colors, j);
      j += 3;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));

    const material = new LineBasicMaterial({
      vertexColors: true,
      toneMapped: false
    });

    super(geometry, material);

    this.type = "GridHelper";
  }
}

export { GridHelper };
