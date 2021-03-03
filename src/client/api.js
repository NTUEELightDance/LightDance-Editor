export const syncPost = (branchName, from, type, mode, data) => {
  const payload = JSON.stringify({ branchName, from, type, mode, data });
  console.log(payload);
  return fetch("/api/sync", {
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
  return fetch("/api/login", {
    method: "POST",
    body: payload,
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((result) => {
      console.log(JSON.parse(result));
    })
    .catch((error) => console.log("error", error));
};

export const getBranches = () => {
  return fetch("/api/branch", {
    method: "GET",
  })
    .then((response) => response.text())
    .then((result) => console.log(JSON.parse(result).data))
    .catch((error) => console.log("error", error));
};

export const createBranch = (branchName) => {
  const payload = JSON.stringify({ branchName });
  return fetch("/api/branch", {
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
  return fetch("/api/branch", {
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

export const CommandAgent = () => {};
