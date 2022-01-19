/* eslint-disable no-console */
// for zip
import JSZip from "jszip";
import { saveAs } from "file-saver";
import JSZipUtils from "jszip-utils";
import dayjs from "dayjs";

// import fetchTexture for img download
import { fetchTexture } from "../../api";

// import store
import store from "../../store";

export const uploadJson = (files) => {
  return new Promise((resolve, reject) => {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (res) => {
      resolve(JSON.parse(res.target.result));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

// start order strictly increasing && dancer parts exists in store.load.dancers.dancer0

export const checkControlJson = (controlRecord, controlMap) => {
  const mapIsValid = Object.values(controlMap).every((frame, frameIdx) => {
    if (typeof frame.start !== "number") {
      console.error(`[Error] "start" is not a number in frame ${frameIdx}`);
      return false;
    }
    if (typeof frame.fade !== "boolean") {
      console.error(`[Error] "fade" is not a boolean in frame ${frameIdx}`);
      return false;
    }
    if (!("status" in frame)) {
      console.error(`[Error] "status" is undefined in frame ${frameIdx}`);
      return false;
    }
    return Object.entries(frame.status).every(([dancerName, dancerStatus]) => {
      const partList = Object.keys(dancerStatus);
      const elParts = Object.keys(
        store.getState().load.dancers[dancerName]["ELPARTS"]
      );
      const ledParts = Object.keys(
        store.getState().load.dancers[dancerName]["LEDPARTS"]
      );

      return partList.every((part) => {
        // check EL Parts
        if (elParts.includes(part)) {
          // check elParts
          if (typeof dancerStatus[part] !== "number") {
            console.error(
              `[Error] frame ${frameIdx}, ${dancerName}'s ${part} is not a number`
            );
            return false;
          }
          return true;
        }
        if (ledParts.includes(part)) {
          // check ledparts
          const { src, alpha } = dancerStatus[part];
          if (typeof src !== "string" || src.length === 0) {
            console.error(
              `[Error] frame ${frameIdx}, ${dancerName}'s ${part}'s src is invalid`
            );
            return false;
          }
          if (typeof alpha !== "number") {
            console.error(
              `[Error] frame ${frameIdx}, ${dancerName}'s ${part}'s alpha is not a number`
            );
            return false;
          }
          return true;
        }
        console.error(
          `[Error]  frame ${frameIdx}, ${dancerName}'s ${part} should not exist`
        );
        return false;
      });
    });
  });
  const recordIsValid =
    Array.isArray(controlRecord) &&
    controlRecord.length !== 0 &&
    controlRecord.every((id, index) => {
      if (index === controlRecord.length - 1) return true;
      const nextId = controlRecord[index + 1];
      if (controlMap[id].start > controlMap[nextId].start) return false;
      return true;
    });

  const idListofMap = Object.keys(controlMap);
  const isMatched =
    controlRecord.length === idListofMap.length &&
    controlRecord.every((id) => {
      if (!idListofMap.includes(id)) return false;
      return true;
    });
  const checkPass = mapIsValid && recordIsValid && isMatched;
  let errorMessage;
  if (!mapIsValid) {
    errorMessage = "controlMap.json format wrong, please check console";
  } else if (!recordIsValid) {
    errorMessage = "controlRecord.json format wrong";
  } else if (!isMatched) {
    errorMessage = "controlMap and controlRecord are not matched";
  }

  return { checkPass, errorMessage };
};
export const checkPosJson = (position) => {
  if (!Array.isArray(position) || position.length === 0) {
    console.error("[Error] position not array or position is empty");
    return false;
  }
  return position.every((frame, frameIdx) => {
    if (!("start" in frame)) {
      console.error(`[Error] "start" is undefined in frame ${frameIdx}`);
      return false;
    }
    if (!("pos" in frame)) {
      console.error(`[Error] "pos" is undefined in frame ${frameIdx}`);
      return false;
    }
    return Object.entries(frame.pos).every(([dancerName, { x, y, z }]) => {
      if (
        typeof x !== "number" ||
        typeof y !== "number" ||
        typeof z !== "number"
      ) {
        console.error(
          `[Error] x, y, z not number in frame ${frameIdx} and dancer ${dancerName}`
        );
        return false;
      }
      return true;
    });
  });
};

const createFolder = (currentFolder, remainPath) => {
  if (remainPath.length && !(remainPath[0] in currentFolder.files)) {
    const newFolder = currentFolder.folder(remainPath[0]);
    return createFolder(newFolder, remainPath.slice(1));
  }
  return currentFolder;
};

const urlToPromise = (url) =>
  new Promise(function (resolve, reject) {
    JSZipUtils.getBinaryContent(url, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

// * |- asset/
//  *      |- BlackPart
//  *      |- LED
//  *      |- Part
//  * |- controlRecord.json
//  * |- position.json
//  * |- texture.json

// TODEL: make this a util
// eslint-disable-next-line class-methods-use-this
const downloadJson = (exportObj, exportName) => {
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportObj)
  )}`;
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", `${exportName}.json`);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const downloadControlJson = async (controlRecord, controlMap) => {
  const now = dayjs().format("YYYYMMDD_HHmm");
  downloadJson(controlRecord, `controlRecord_${now}`);
  downloadJson(controlMap, `controlMap_${now}`);
};

export const downloadPos = async (position) => {
  const now = dayjs().format("YYYYMMDD_HHmm");
  downloadJson(position, `position_${now}`);
};

export const downloadEverything = async (
  controlRecord,
  controlMap,
  position
) => {
  const texture = await fetchTexture();
  const zip = new JSZip();

  zip.file("controlRecord.json", JSON.stringify(controlRecord));
  zip.file("controlMap.json", JSON.stringify(controlMap));
  zip.file("position.json", JSON.stringify(position));
  zip.file("texture.json", JSON.stringify(texture));

  Object.keys(texture).forEach((partType) => {
    // here, the image is fetched from the server, only to be zippeds
    Object.values(texture[partType]).forEach((partData) => {
      const { prefix, name, postfix } = partData;
      const folderToStore = createFolder(zip, prefix.split("/").slice(1));
      if (typeof name === "string") {
        const href = `${prefix}${name}${postfix}`;
        folderToStore.file(`${name}${postfix}`, urlToPromise(href), {
          binary: true,
        });
      } else {
        name.forEach((partName) => {
          const href = `${prefix}${partName}${postfix}`;
          folderToStore.file(`${partName}${postfix}`, urlToPromise(href), {
            binary: true,
          });
        });
      }
    });
  });
  const now = dayjs().format("YYYYMMDD_HHmm");
  zip.generateAsync({ type: "blob" }).then((content) => {
    // see FileSaver.js
    saveAs(content, `light_dance_${now}.zip`);
  });
};
