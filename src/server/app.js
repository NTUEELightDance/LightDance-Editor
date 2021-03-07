/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/* eslint-disable global-require */
const express = require("express");
const path = require("path");
const Websocket = require("ws");
const http = require("http");
const bodyParser = require("body-parser");

const { COMMANDS } = require("../constant");
const DancerSocket = require("./websocket/dancerSocket");
const EditorSocket = require("./websocket/editorSocket");
const board_config = require("../../data/board_config.json");

// const router = express.Router();
const app = express();
const server = http.createServer(app);
const wss = new Websocket.Server({ server });

const dancerClients = {};
const editorClients = {};

const socketReceiveData = (from, msg) => {
  console.log("dancerClients: ", Object.keys(dancerClients));
  console.log("editorClients: ", Object.keys(editorClients));

  const { type, task, payload } = msg;
  switch (type) {
    case "dancer": {
      Object.values(editorClients).forEach((editor) => {
        editor.sendDataToClientEditor([
          task,
          {
            from,
            response: payload,
          },
        ]);
      });
      break;
    }
    case "Editor": {
      break;
    }
    default:
      break;
  }
};
const DancerSocketAgent = {
  addDancerClient: (dancerName, dancerSocket) => {
    dancerClients[dancerName] = dancerSocket;
  },
  deleteDancerClient: (dancerName) => {
    delete dancerClients[dancerName];
  },
  socketReceiveData,
};
const EditorSocketAgent = {
  addEditorClient: (editorName, editorSocket) => {
    editorClients[editorName] = editorSocket;
  },
  deleteEditorClient: (editorName) => {
    delete editorClients[editorName];
  },
  socketReceiveData,
};

if (process.env.NODE_ENV === "dev") {
  require("dotenv").config();
  const webpack = require("webpack");
  const { merge } = require("webpack-merge");
  const commonConfig = require("../../config/webpack.common.js");
  const envConfig = require("../../config/webpack.dev.js");
  const webpackConfig = merge(commonConfig, envConfig);
  const compiler = webpack(webpackConfig);

  app.use(
    require("webpack-dev-middleware")(compiler, {
      publicPath: webpackConfig.output.publicPath,
    })
  );
  app.use(
    require("webpack-hot-middleware")(compiler, {
      log: false,
      path: "/__hmr",
      heartbeat: 2000,
    })
  );
} else {
  const buildPath = path.resolve(__dirname, "..", "..", "./build");
  app.use(express.static(buildPath));
}

const assetPath = path.resolve(__dirname, "..", "..", "./asset");
app.use("/asset", express.static(assetPath));
const dataPath = path.resolve(__dirname, "..", "..", "./data");
app.use("/data", express.static(dataPath));

wss.on("connection", (ws) => {
  ws.onmessage = (msg) => {
    const [task, payload] = JSON.parse(msg.data);
    console.log("Client response: ", task, "\nPayload: ", payload);

    const { type } = payload;

    if (task === "boardInfo") {
      const hostName = payload.name;
      // import board_config to check dancer's name
      // get dancerName from hostname
      if (type === "dancer") {
        if (board_config[hostName] !== undefined) {
          const { dancerName } = board_config[hostName];
          // ask about dancerClient
          const dancerSocket = new DancerSocket(
            ws,
            dancerName,
            DancerSocketAgent
          );
          dancerSocket.handleMessage();

          const firstMsg = {
            type: payload.type,
            task,
            payload: {
              OK: payload.OK,
              msg: payload.msg,
              ip: dancerSocket.clientIp,
            },
          };

          socketReceiveData(dancerName, firstMsg);
        }
      } else if (type === "editor") {
        const editorName = hostName; // send from editorSocketAPI

        const editorSocket = new EditorSocket(
          ws,
          editorName,
          EditorSocketAgent
        );

        editorSocket.handleMessage();
      }
    }
  };
});

app.use(bodyParser.json({ limit: "200mb" }));

COMMANDS.forEach((command) => {
  app.post(`/api/${command}`, (req, res) => {
    // console.log(command); // for test
    // console.log(req.body);
    const { selectedDancers } = req.body;
    switch (command) {
      case "play": {
        const { startTime, whenToPlay } = req.body;
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].play(startTime, whenToPlay);
        });
        break;
      }
      case "uploadControl": {
        const { controlJson } = req.body;
        selectedDancers.forEach((dancerName) => {
          // TODO: if the status is same as last one => need to delete
          const dancerJson = controlJson.map(({ start, status, fade }) => ({
            start,
            fade,
            status: status[dancerName],
          }));
          // console.log(`server/app.js, uploadControl`, dancerJson);
          dancerClients[dancerName].uploadControl(dancerJson);
        });
        break;
      }
      case "uploadLed": {
        const { ledData } = req.body;
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].uploadLED(ledData);
        });
        break;
      }
      case "lightCurrentStatus": {
        const { lightCurrentStatus } = req.body;
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].lightCurrentStatus(
            lightCurrentStatus[dancerName]
          );
        });
        break;
      }
      case "sync": {
        selectedDancers.forEach((dancerName) => {
          // TODO
        });
        break;
      }
      case "start": {
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].start();
        });
        break;
      }
      case "load": {
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].load();
        });
        break;
      }
      case "pause": {
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].pause();
        });
        break;
      }
      case "stop": {
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].stop();
        });
        break;
      }
      case "terminate": {
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].terminate();
        });
        break;
      }
      case "kick": {
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].kick();
        });
        break;
      }
      case "shutdown": {
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].shutdown();
        });
        break;
      }
      case "reboot": {
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].reboot();
        });
        break;
      }
      case "kill": {
        selectedDancers.forEach((dancerName) => {
          dancerClients[dancerName].kill();
        });
        break;
      }
      default: {
        break;
      }
    }
    res.send(command);
  });
});

const port = 8080;

server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
