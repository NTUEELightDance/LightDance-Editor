import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:4000",
});

const downloadControlJson = async () => {
  const { data } = await instance.get("/api/exportData.json");
  console.log(data);
  return data;
};

export default downloadControlJson;
