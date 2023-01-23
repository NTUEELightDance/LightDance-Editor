import axios from "./axios";

export const loginAgent = {
  login: async (username: string, password: string) => {
    const res = await axios.post("/login", { username, password });
    return {
      token: res.data.token,
      success: res.status === 200,
    };
  },
  // check token in cookie
  checkToken: async () => {
    const res = await axios.get("/checkToken");
    return {
      token: res.data.token,
      success: res.status === 200,
    };
  },
};
