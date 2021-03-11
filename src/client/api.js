import { login } from "./slices/globalSlice";
import store from "./store";

export const syncPost = (branchName, from, type, mode, data) => {
  const payload = JSON.stringify({ branchName, from, type, mode, data });
  return fetch("/api/editor/sync", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((result) => console.log(JSON.parse(JSON.parse(result).data)))
    .catch((error) => console.log("error", error));
};

export const loginPost = (username, password) => {
  const payload = JSON.stringify({ username, password });
  return fetch("/api/editor/login", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      const data = JSON.parse(result);
      if (data.username) {
        store.dispatch(login(data));
      }
    })
    .catch((error) => console.log("error", error));
};

export const getBranches = () => {
  return fetch("/api/editor/branch", {
    method: "GET",
  })
    .then((response) => response.text())
    .then((result) => console.log(JSON.parse(result).branches))
    .catch((error) => console.log("error", error));
};

export const createBranch = (branchName) => {
  const payload = JSON.stringify({ branchName });
  return fetch("/api/editor/branch", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((result) => console.log(JSON.parse(result).data))
    .catch((error) => console.log("error", error));
};

export const deleteBranch = (branchName) => {
  const payload = JSON.stringify({ branchName });
  return fetch("/api/editor/branch", {
    method: "DELETE",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((result) => console.log(JSON.parse(result).data))
    .catch((error) => console.log("error", error));
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

export const uploadImages = (files, path) => {
  const formData = new FormData();
  files.forEach((file, i) => {
    formData.append(`image${i}`, file);
  });

  formData.append("filePath", path);

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

export const CommandAgent = () => {};
