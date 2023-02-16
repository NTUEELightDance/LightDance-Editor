import { LineSegments } from "three/src/objects/LineSegments.js";
import { LineBasicMaterial } from "three/src/materials/LineBasicMaterial.js";
import { Float32BufferAttribute } from "three/src/core/BufferAttribute.js";
import { BufferGeometry } from "three/src/core/BufferGeometry.js";
import { Color } from "three/src/math/Color.js";

class GridHelper extends LineSegments {
  colors: number[] = [];
  colorsIndex = 0;
  colorsAppend = (color: Color) => {
    color.toArray(this.colors, this.colorsIndex);
    this.colorsIndex += 3;
    color.toArray(this.colors, this.colorsIndex);
    this.colorsIndex += 3;
  };

  constructor(horLen = 60, verLen = 30, horDiv = 20, verDiv = 10) {
    // (horizontalLength, verticalLength, horizontalDivisions, verticalDivisions)

    const geometry = new BufferGeometry();
    const material = new LineBasicMaterial({
      vertexColors: true,
      toneMapped: false,
    });
    super(geometry, material);

    const centralColor = new Color(0xff7575);
    const gridColor = new Color(0x888888);
    const vertices = [];

    // vertical grids
    let intervals = horLen / horDiv;
    let center = horDiv / 2;
    let xPos = -horLen / 2;
    for (let i = 0; i <= horDiv; i++, xPos += intervals) {
      vertices.push(xPos, 0, -verLen / 2, xPos, 0, verLen / 2); // two endpoints of the line (x1, y1, z1, x2, y2, z2)
      if (i === center) this.colorsAppend(centralColor);
      else this.colorsAppend(gridColor);
    }

    // horizontal grids
    intervals = verLen / verDiv;
    center = verDiv / 2;
    let zPos = -verLen / 2;
    for (let i = 0; i <= verDiv; i++, zPos += intervals) {
      vertices.push(-horLen / 2, 0, zPos, horLen / 2, 0, zPos);
      if (i === center) this.colorsAppend(centralColor);
      else this.colorsAppend(gridColor);
    }

    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new Float32BufferAttribute(this.colors, 3));

    this.type = "GridHelper";
  }
}

export { GridHelper };
