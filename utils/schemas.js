const configSchema = {
  type: "object",
  properties: {
    OFPARTS: {
      type: "object",
      patternProperties: {
        ".*$": { type: "number" },
      },
    },
    LEDPARTS: {
      type: "object",
      patternProperties: {
        ".*$": {
          type: "object",
          properties: {
            id: { type: "integer" },
            len: { type: "integer" },
          },
        },
      },
    },
  },
  required: ["OFPARTS", "LEDPARTS"],
  additionalProperties: false,
};

const LEDIdSchema = {
  type: "array",
  items: { type: "number", minimum: 0, maximum: 26 },
  uniqueItems: true,
};

const FiberIdSchema = {
  type: "array",
  items: { type: "number", minimum: 0, maximum: 26 },
  uniqueItems: true,
};

const LEDSchema = {
  type: "object",
  patternProperties: {
    ".*$": {
      type: "array",
      items: {
        type: "object",
        properties: {
          start: { type: "number" },
          fade: { type: "boolean" },
          status: {
            type: "array",
            items: {
              type: "object",
              properties: {
                colorCode: { type: "number" },
                alpha: { type: "number", minimum: 0, maximum: 15 },
              },
            },
          },
        },
      },
    },
  },
};

const FiberSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      start: { type: "number" },
      fade: { type: "boolean" },
      status: {
        type: "object",
        patternProperties: {
          ".*$": {
            type: "object",
            properties: {
              colorCode: { type: "integer" },
              alpha: { type: "number", minimum: 0, maximum: 15 },
            },
          },
        },
      },
    },
  },
};

module.exports = {
  configSchema,
  LEDIdSchema,
  FiberIdSchema,

  LEDSchema,
  FiberSchema,
};
