const fs = require("fs");

const API_ROOT = "http://localhost:4000/api";

// login with the admin user
async function login(username, password) {
  const res = await fetch(`${API_ROOT}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
  const { token } = await res.json();
  return token;
}

async function createUser(token, username, password) {
  try {
    const res = await fetch(`${API_ROOT}/createUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `token=${token}`,
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    const message = await res.text();
    console.log(message);
  } catch (err) {
    console.error(
      `failed to create user ${username}, usually because it already exists`
    );
  }
}

(async () => {
  const usersFile = process.argv[2];
  // read the users file as json
  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  // login as admin  and get the token
  const token = await login("admin", "admin");

  // create the users
  await Promise.all(
    users.map(({ username, password }) => createUser(token, username, password))
  );
})();
