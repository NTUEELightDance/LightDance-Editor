export const syncPost = (
  type,
  mode,
  data,
  branchName = "main",
  from = "Ken"
) => {
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

export const Login = (username, password) => {
  const payload = JSON.stringify({ username, password });
  return fetch("/api/login", {
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

export const CommandAgent = () => {};
