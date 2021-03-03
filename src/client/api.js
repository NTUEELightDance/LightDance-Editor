import { syncPos, syncStatus, syncDelete } from "./slices/globalSlice";
import store from "./store";

export const multiEditAgent = (e) => {
  const { mode, type } = JSON.parse(e.data);
  if (mode === "EDIT") {
    if (type === "control") {
      store.dispatch(syncStatus(JSON.parse(e.data)));
    }
    if (type === "position") {
      store.dispatch(syncPos(JSON.parse(e.data)));
    }
  }
  if (mode === "ADD") {
    if (type === "control") {
      store.dispatch(syncStatus(JSON.parse(e.data)));
    }
    if (type === "position") {
      store.dispatch(syncPos(JSON.parse(e.data)));
    }
  }
  if (mode === "DEL") {
    store.dispatch(syncDelete(JSON.parse(e.data)));
  }
};

export const syncPost = (type, mode, data) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("type", type);
  urlencoded.append("mode", mode);
  urlencoded.append("data", data);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  return fetch("/api/sync", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(JSON.parse(JSON.parse(result).data)))
    .catch((error) => console.log("error", error));
};

export const CommandAgent = () => {};
