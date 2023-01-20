/* eslint-disable no-console */
import dayjs from "dayjs";

// import Schema
import {
  controlValidatorSchema,
  posValidatorSchema,
  colorValidatorSchema,
  ledValidatorSchema,
} from "./validatorShema";

// import validator
import Ajv from "ajv";

// import apis
import {
  uploadExportDataApi,
  uploadLedDataApi,
  downloadExportDataApi,
  downloadLedDataApi,
} from "../../../api";

import { notification } from "core/utils";

const uploadJson = async (files) => {
  return await new Promise((resolve, reject) => {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (res) => {
      resolve(JSON.parse(res.target.result));
    };
    reader.onerror = (err) => {
      reject(err);
    };
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
  if (valid) notification.success("Check Passed. Ready to upload.");
  return valid;
};

const checkControlJson = (exportJson) => {
  const Schemas = controlValidatorSchema(exportJson.dancer);
  const controlIsValid = Object.values(exportJson.control).every((frame) => {
    return Object.entries(frame.status).every(([dancerName, dancerParts]) => {
      // validate format and content
      const ajv = new Ajv();
      const validate = ajv.compile(Schemas[dancerName]);
      const valid = validate(dancerParts);
      if (!valid) {
        const { keyword, instancePath, message } = validate.errors[0];
        notification.error(`${keyword} Error: ${instancePath} ${message}`);
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
        notification.error(`${keyword} Error: ${instancePath} ${message}`);
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
    notification.error(`${keyword} Error: ${instancePath} ${message}`);
  }
  return colorIsValid;
};
export const checkLedJson = async (ledFile) => {
  const ledJson = await uploadJson(ledFile); // read file into json format
  const effectSchema = ledValidatorSchema();
  const ajv = new Ajv();
  const validate = ajv.compile(effectSchema);
  const ledIsValid = Object.values(ledJson).every((ledPartName) => {
    return Object.entries(ledPartName).every(([effectName, effect]) => {
      const valid = validate(effect);
      if (!valid) {
        const { keyword, instancePath, message } = validate.errors[0];
        notification.error(
          `${keyword} Error: ${effectName}${instancePath} ${message}`
        );
      }
      return valid;
    });
  });
  return ledIsValid;
};

// eslint-disable-next-line
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
// eslint-disable-next-line
export const uploadExportJson = async (exportFile) => {
  await uploadExportDataApi(exportFile[0]); // take File out of Filelist
};
export const downloadLedJson = async () => {
  const now = dayjs().format("YYYYMMDD_HHmm");
  const LedJson = await downloadLedDataApi();
  downloadJson(LedJson, `LED_${now}`);
};
// eslint-disable-next-line
export const uploadLedJson = async (ledFile) => {
  await uploadLedDataApi(ledFile[0]);
};
