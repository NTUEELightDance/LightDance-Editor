import store from "../store";
import client from "../client";

// gql
import {
  GET_CONTROL_MAP,
  GET_CONTROL_RECORD,
  GET_POS_MAP,
  GET_POS_RECORD,
} from "../graphql";

/**
 * controlAgent: reponsible for controlMap and controlRecord
 */
export const controlAgent = {
  getControlMap: async () => {
    const controlMapData = await client.query({ query: GET_CONTROL_MAP });
    return controlMapData.data.ControlMap.frames;
  },
  getControlRecord: async () => {
    const controlRecordData = await client.query({ query: GET_CONTROL_RECORD });
    return controlRecordData.data.controlFrameIDs;
  },
};

/**
 * posAgent: responsible for posMap and posRecord
 */
export const posAgent = {
  getPosMap: async () => {
    const posMapData = await client.query({ query: GET_POS_MAP });
    return posMapData.data.PosMap.frames;
  },

  getPosRecord: async () => {
    const posRecordData = await client.query({ query: GET_POS_RECORD });
    return posRecordData.data.positionFrameIDs;
  },
};

export const uploadJson = (file, type) => {
  const formData = new FormData();

  formData.append(type, file);
  if (type === "position" && type === "control") {
    fetch(`/api/editor/upload/${type}`, {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

export const uploadImages = (files, path, imagePrefix) => {
  const formData = new FormData();
  files.forEach((file, i) => {
    formData.append(`image${i}`, file);
  });

  formData.append("filePath", path);
  formData.append("imagePrefix", imagePrefix);

  fetch("/api/editor/upload/images", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const requestDownload = (control, position, texture) => {
  const payload = JSON.stringify({ control, position, texture });

  fetch("/api/editor/download", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
};

export const fetchTexture = () => {
  const texturePath = store.getState().load.load.Texture;
  return fetch(texturePath, {
    method: "GET",
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
};
