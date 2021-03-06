import axios from "axios";
import { COMMANDS } from "../../constants";

export default COMMANDS.reduce((acc, command) => {
  let callback = null;
  switch (command) {
    case "play":
      callback = ({ startTime, whenToPlay }) => {
        // fetch(`api/${command}`, {
        //   method: "POST",
        //   body: JSON.stringify({ startTime, whenToPlay }),
        // });
        axios.post(`/api/${command}`, {
          startTime,
          whenToPlay,
        });
      };
      break;
    case "uploadControl":
      callback = ({ controlJson }) => {
        console.log(controlJson);
        // fetch(`api/${command}`, {
        //   method: "POST",
        //   body: JSON.stringify(controlJson),
        // });
        axios.post(`/api/${command}`, { controlJson });
      };
      break;
    case "uploadLed":
      // ledData is an array
      callback = ({ ledData }) => {
        // fetch(`api/${command}`, {
        //   method: "POST",
        //   body: JSON.stringify({ ledData }),
        // });
        axios.post(`/api/${command}`, { ledData });
      };
      break;
    case "lightCurrentStatus":
      callback = ({ lightCurrentStatus }) => {
        // fetch(`api/${command}`, {
        //   method: "POST",
        //   body: JSON.stringify({ lightCurrentStatus }),
        // });
        axios.post(`/api/${command}`, { lightCurrentStatus });
      };
      break;
    default:
      callback = () => {
        //         fetch(`api/${command}`, { method: "POST" });
        axios.post(`/api/${command}`);
      };
      break;
  }
  return {
    ...acc,
    [command]: callback,
  };
}, {});
