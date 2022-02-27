const FIBERType = {
  type: "object",
  required: ["color", "alpha"],
  properties: {
    color: { type: "string" },
    alpha: { type: "number" },
  },
};

const LEDType = {
  type: "object",
  required: ["src", "alpha"],
  properties: {
    src: { type: "string" },
    alpha: { type: "number" },
  },
};

const COORDINATEType = {
  type: "object",
  required: ["x", "y", "z"],
  properties: {
    x: { type: "number" },
    y: { type: "number" },
    z: { type: "number" },
  },
};
export const controlValidatorSchema = (dancer) => {
  let Schemas = {};
  dancer.forEach((dancer) => {
    let dancerSchema = {
      type: "object",
      properties: {},
    };
    dancer.parts.forEach((partInfo) => {
      let partType;
      switch (partInfo.type) {
        case "LED":
          partType = LEDType;
          break;
        case "FIBER":
          partType = FIBERType;
          break;
      }
      dancerSchema.properties[partInfo.name] = partType;
    });
    Schemas[dancer.name] = dancerSchema;
  });
  return Schemas;
};

export const posValidatorSchema = () => {
  const Schema = COORDINATEType;
  return Schema;
};
export const colorValidatorSchema = (colorMap) => {
  let Schema = {
    type: "object",
    properties: {},
    required: [],
  };
  Object.keys(colorMap).forEach((color) => {
    Schema.properties[color] = { type: "string" };
    Schema.required.push(color);
  });
  return Schema;
};
