import axios from "axios";

const instance = axios.create({
  baseURL: "/api/editor-server",
});

export { instance };
