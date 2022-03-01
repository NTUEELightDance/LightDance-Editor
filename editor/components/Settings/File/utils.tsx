/* eslint-disable no-console */
// for zip
import JSZip from "jszip";
import { saveAs } from "file-saver";
import JSZipUtils from "jszip-utils";
import dayjs from "dayjs";
// import fetchTexture for img download
import { fetchTexture } from "../../../api";

//import Schema
import {
  controlValidatorSchema,
  posValidatorSchema,
  colorValidatorSchema,
} from "./validatorShema";

//import validator
import Ajv from "ajv";

// import store
import store from "../../../store";

//import apis
import { uploadeExportDataApi, downloadExportDataApi } from "../../../api";

const uploadJson = (files) => {
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
export const checkExportJson = async (exportFile) => {
  const exportJson = await uploadJson(exportFile);
  const valid =
    checkControlJson(exportJson) &&
    checkPosJson(exportJson) &&
    checkColorJson(exportJson);
  if (valid) alert("Check Passed. Ready to upload.");
  return valid;
};

const checkControlJson = (exportJson) => {
  const Schemas = controlValidatorSchema(exportJson.dancer);
  const controlIsValid = Object.values(exportJson.control).every((frame) => {
    return Object.entries(frame.status).every(([dancerName, dancerParts]) => {
      //validate format and content
      const ajv = new Ajv();
      const validate = ajv.compile(Schemas[dancerName]);
      const valid = validate(dancerParts);
      if (!valid) {
        const { keyword, instancePath, message } = validate.errors[0];
        alert(`${keyword} Error: ${instancePath} ${message}`);
      }
      return valid;
    });
  });

  return controlIsValid;
};
const checkPosJson = (exportJson) => {
  const Schema = posValidatorSchema();
  const posIsValid = Object.values(exportJson.position).every((frame) => {
    return Object.entries(frame.pos).every(([dancerName, dancerPos]) => {
      const ajv = new Ajv();
      const validate = ajv.compile(Schema);
      const valid = validate(dancerPos);
      if (!valid) {
        const { keyword, instancePath, message } = validate.errors[0];
        alert(`${keyword} Error: ${instancePath} ${message}`);
      }
      return valid;
    });
  });
  return posIsValid;
};

const checkColorJson = (exportJson) => {
  const Schema = colorValidatorSchema(exportJson.color);
  const ajv = new Ajv();
  const validate = ajv.compile(Schema);
  const colorIsValid = validate(exportJson.color);
  if (!colorIsValid) {
    const { keyword, instancePath, message } = validate.errors[0];
    alert(`${keyword} Error: ${instancePath} ${message}`);
  }
  return colorIsValid;
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
export const downloadExportJson = async () => {
  const now = dayjs().format("YYYYMMDD_HHmm");

  const exportJson = await downloadExportDataApi();
  downloadJson(exportJson, `export_${now}`);
};
export const uploadExportJson = async (exportFile) => {
  await uploadeExportDataApi(exportFile[0]); //take File out of Filelist
};

export const downloadControlJson = async (controlRecord, controlMap) => {
  const now = dayjs().format("YYYYMMDD_HHmm");
  downloadJson(controlRecord, `controlRecord_${now}`);
  downloadJson(controlMap, `controlMap_${now}`);
};

// export const downloadEverything = async (
//   controlRecord,
//   controlMap,
//   position
// ) => {
//   const texture = await fetchTexture();
//   const zip = new JSZip();

//   zip.file("controlRecord.json", JSON.stringify(controlRecord));
//   zip.file("controlMap.json", JSON.stringify(controlMap));
//   zip.file("position.json", JSON.stringify(position));
//   zip.file("texture.json", JSON.stringify(texture));

//   Object.keys(texture).forEach((partType) => {
//     // here, the image is fetched from the server, only to be zippeds
//     Object.values(texture[partType]).forEach((partData) => {
//       const { prefix, name, postfix } = partData;
//       const folderToStore = createFolder(zip, prefix.split("/").slice(1));
//       if (typeof name === "string") {
//         const href = `${prefix}${name}${postfix}`;
//         folderToStore.file(`${name}${postfix}`, urlToPromise(href), {
//           binary: true,
//         });
//       } else {
//         name.forEach((partName) => {
//           const href = `${prefix}${partName}${postfix}`;
//           folderToStore.file(`${partName}${postfix}`, urlToPromise(href), {
//             binary: true,
//           });
//         });
//       }
//     });
//   });
//   const now = dayjs().format("YYYYMMDD_HHmm");
//   zip.generateAsync({ type: "blob" }).then((content) => {
//     // see FileSaver.js
//     saveAs(content, `light_dance_${now}.zip`);
//   });
// };
