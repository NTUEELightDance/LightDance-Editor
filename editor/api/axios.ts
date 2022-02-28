import axios from "axios";

const instance = axios.create({
  //   baseURL: process.env.REACT_APP_BASE_URL,
  baseURL: "/api/editor-server",
});

export default instance;
