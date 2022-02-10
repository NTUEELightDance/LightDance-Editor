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

const REQUEST_EDIT_POS = gql`
  mutation RequestEditPosition($frameId: String!) {
    RequestEditPosition(FrameID: $frameId) {
      editing
      ok
    }
  }
`;

const REQUEST_EDIT_CONTROL = gql`
  mutation RequestEditControl($frameId: String!) {
    RequestEditControl(FrameID: $frameId) {
      editing
      ok
    }
  }
`;

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

const ADD_CONTROLFRAME = gql`
  mutation AddControlFrame($start: Float!) {
    addControlFrame(start: $start) {
      start
      fade
      editing
      id
    }
  }
`;

const ADD_POSFRAME = gql`
  mutation AddPositionFrame($start: Float!) {
    addPositionFrame(start: $start) {
      start
      editing
      id
    }
  }
`;

const EDIT_CONTROLMAP = gql`
  mutation EditControlMap(
    $frameId: String!
    $controlData: [EditControlInput!]!
  ) {
    editControlMap(frameID: $frameId, controlData: $controlData) {
      frame
    }
  }
`;

const EDIT_CONTROLFRAME = gql`
  mutation EditControlFrame($input: EditControlFrameInput!) {
    editControlFrame(input: $input) {
      start
      fade
      id
    }
  }
`;

const EDIT_POSMAP = gql`
  mutation EditPosMap($frameId: String!, $positionData: [EditPositionInput!]!) {
    editPosMap(frameID: $frameId, positionData: $positionData) {
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
      const data = await client.request(ADD_CONTROLFRAME, {
        start,
      });
      const frameId = data.addControlFrame.id;
      console.log(`Editing controlRecord frame: ${frameId}`);
      await client.request(EDIT_CONTROLFRAME, {
        input: {
          id: frameId,
          fade,
        },
      });

      console.log(`Requesting edit control: ${frameId} ...`);
      await client.request(REQUEST_EDIT_CONTROL, {
        frameId,
      });

      console.log(`Editing controlMap of id: ${frameId} ...`);
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
        frameId,
        controlData: controlData,
        fade,
      });
    } catch (err) {
      console.error(JSON.stringify(err, undefined, 2));
    }
  }
};

/**
 * Init posRecord and posMap
 */
const initPos = async (client) => {
  const posJson = readJson("../others/dance_json/position_2021.json");
  for (const { start, pos } of posJson) {
    let frameId = "";
    try {
      console.log(`Adding posRecord start: ${start} ...`);
      const data = await client.request(ADD_POSFRAME, {
        start,
      });
      frameId = data.addPositionFrame.id;
    } catch (err) {
      console.error(JSON.stringify(err, undefined, 2));
      continue;
    }
    // after adding frame, we need to have a delay, or it may have errors
    // I don't know why
    // only occurs in first three pos frame
    await new Promise((r) => setTimeout(r, 300));

    try {
      console.log("requesting edit pos");
      await client.request(REQUEST_EDIT_POS, {
        frameId,
      });
    } catch (err) {
      console.error(JSON.stringify(err, undefined, 2));
    }

    try {
      console.log(`Editing posMap of id: ${frameId} ...`);
      const positionData = Object.keys(pos).map((dancerName) => ({
        dancerName,
        positionData: pos[dancerName],
      }));

      await client.request(EDIT_POSMAP, {
        frameId,
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
