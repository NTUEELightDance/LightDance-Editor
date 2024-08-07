/**
 * node initDB.js
 */
const { GraphQLClient, gql } = require("graphql-request");
const fs = require("fs");
const { exit } = require("process");

const dancerNames = [
  "1_191",
  "2_ke",
  "3_zhou",
  "4_kuang",
  "5_lin",
  "6_liao",
  "7_mon",
  "8_fan",
  "9_chia",
  "10_lu",
  "1_sw",
  "2_sw",
  "3_sw",
  "4_sw",
  "5_sw",
  "6_sw",
  "7_sw",
  "8_sw",
  "9_sw",
  "10_sw",
];


const ADD_DANCER = gql`
  mutation addDancer($dancer: AddDancerInput!) {
    addDancer(dancer: $dancer) {
      name
      id
      parts {
        name
        id
        type
      }
    }
  }
`;

const ADD_PART = gql`
  mutation addPart($part: AddPartInput!) {
    addPart(part: $part) {
      name
      type
    }
  }
`;


const EDIT_CONTROLMAP = gql`
  mutation EditControlMap(
    $start: Float!
    $fade: Boolean!
    $controlData: [EditControlInput!]!
  ) {
    editControlMap(start: $start, fade: $fade, controlData: $controlData) {
      frame
    }
  }
`;

const EDIT_POSMAP = gql`
  mutation EditPosMap($start: Float!, $positionData: [EditPositionInput!]!) {
    editPosMap(start: $start, positionData: $positionData) {
      frames
    }
  }
`;

/**
 * Init Dancer data
 */
const initDancers = async (client) => {
  for (const dancer of dancerNames) {
    const { ELPARTS, LEDPARTS } = readJson(
      `../files/data/dancers/${dancer}.json`
    );
    console.log(`Adding dancer ${dancer} ...`);
    await client.request(ADD_DANCER, { dancer: { name: dancer } });
    for (const part of Object.keys(ELPARTS)) {
      console.log(`Adding part ${part} ...`);
      await client.request(ADD_PART, {
        part: {
          name: part,
          dancerName: dancer,
          type: "EL",
        },
      });
    }
    for (const part of Object.keys(LEDPARTS)) {
      console.log(`Adding part ${part} ...`);
      await client.request(ADD_PART, {
        part: {
          name: part,
          dancerName: dancer,
          type: "LED",
        },
      });
    }
  }
};

/**
 * Init controlRecrod and controlMap
 */
const initControl = async (client) => {
  const control = readJson("../others/dance_json/control_2021.json");
  for (const { start, status, fade } of control) {
    try {
      console.log(`Adding controlRecord start: ${start} ...`);
      const controlData = Object.keys(status).map((dancerName) => {
        const re = {};
        re.dancerName = dancerName;
        re.controlData = Object.keys(status[dancerName]).map((partName) => {
          const part = {};
          part.partName = partName;
          if (typeof status[dancerName][partName] === "number") {
            part.ELValue = status[dancerName][partName];
          } else {
            part.src = status[dancerName][partName].src;
            part.alpha = status[dancerName][partName].alpha;
          }
          return part;
        });
        return re;
      });
      await client.request(EDIT_CONTROLMAP, {
        start,
        controlData,
        fade,
      });
    } catch (err) {
      console.error(err);
    }
  }
};

/**
 * Init posRecord and posMap
 */
const initPos = async (client) => {
  const posJson = readJson("../others/dance_json/position_2021.json");
  for (const { start, pos } of posJson) {
    try {
      console.log(`Adding posMap of start: ${start} ...`);
      const positionData = Object.keys(pos).map((dancerName) => ({
        dancerName,
        positionData: pos[dancerName],
      }));

      await client.request(EDIT_POSMAP, {
        start,
        positionData,
      });
    } catch (err) {
      console.error(JSON.stringify(err, undefined, 2));
    }
  }
};

/**
 * Read Json from given path
 */
const readJson = (path) => {
  let raw = null;
  try {
    raw = fs.readFileSync(path);
  } catch (err) {
    console.error(err);
    exit();
  }
  return JSON.parse(raw);
};

async function main() {
  const endpoint = "http://localhost:4000/graphql";

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      name: "hello",
      userid: "hi",
    },
  });

  await initDancers(graphQLClient);
  await initPos(graphQLClient);
  await initControl(graphQLClient);
}

main().catch((error) => console.error(error));