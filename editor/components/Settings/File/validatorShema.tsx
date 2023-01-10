const FiberSchema = {
  type: "object",
  required: ["color", "alpha"],
  properties: {
    color: { type: "string" },
    alpha: { type: "number" }
  }
};

const LedSchema = {
  type: "object",
  required: ["src", "alpha"],
  properties: {
    src: { type: "string" },
    alpha: { type: "number" }
  }
};

const CoordinateSchema = {
  type: "object",
  required: ["x", "y", "z"],
  properties: {
    x: { type: "number" },
    y: { type: "number" },
    z: { type: "number" }
  }
};
const EffectStatusSchema = {
  type: "object",
  properties: {
    effect: {
      type: "array",
      items: { type: "string" }
    },
    _id: { type: "string" },
    start: { type: "number" },
    fade: { type: "boolean" }
  },
  required: ["effect", "_id", "start", "fade"]
};
const LedEffectSchema = {
  type: "object",
  properties: {
    repeat: { type: "number" },
    effects: {
      type: "array",
      items: EffectStatusSchema
    }
  },
  required: ["repeat", "effects"]
};
export const controlValidatorSchema = (dancer) => {
  const Schemas = {};
  dancer.forEach((dancer) => {
    const dancerSchema = {
      type: "object",
      properties: {}
    };
    dancer.parts.forEach((partInfo) => {
      let partType;
      switch (partInfo.type) {
      case "LED":
        partType = LedSchema;
        break;
      case "FIBER":
        partType = FiberSchema;
        break;
      }
      dancerSchema.properties[partInfo.name] = partType;
    });
    Schemas[dancer.name] = dancerSchema;
  });
  return Schemas;
};

export const posValidatorSchema = () => {
  const Schema = CoordinateSchema;
  return Schema;
};
export const colorValidatorSchema = (colorMap) => {
  const Schema = {
    type: "object",
    properties: {},
    required: []
  };
  Object.keys(colorMap).forEach((color) => {
    Schema.properties[color] = { type: "string" };
    Schema.required.push(color);
  });
  return Schema;
};
export const ledValidatorSchema = () => {
  const Schema = LedEffectSchema;
  return Schema;
};
