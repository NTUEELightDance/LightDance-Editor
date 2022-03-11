import store from "../store";

//axios for api
import axios from "./axios";

export * from "./controlAgent";
export * from "./positionAgent";
export * from "./dancerAgent";
export * from "./LedAgent";

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

export const uploadeExportDataApi = async (uploadFile) => {
  const formData = new FormData();
  formData.append("data", uploadFile);
  const response = await axios.post("/uploadData", formData);
  if (response.request.statusText === "OK")
    alert("Upload Success.Please refresh.");
  else alert("Upload Failed.");
};
export const downloadExportDataApi = async () => {
  const response = await axios.get("/exportData.json");
  if (response.request.statusText === "OK") return response.data;
  else alert("Download Failed.");
};
export const uploadLedDataApi = async (ledFile) => {
  const formData = new FormData();
  formData.append("data", ledFile);
  const response = await axios.post("/uploadLED", formData);
  if (response.request.statusText === "OK")
    alert("Upload Success.Please refresh.");
  else alert("Upload Failed.");
};
export const downloadLedDataApi = async () => {
  const response = await axios.get("/exportLED.json");
  if (response.request.statusText === "OK") return response.data;
  else alert("Download Failed.");
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
