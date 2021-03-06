import axios from "axios";
import { COMMANDS } from "../../constants";

export default COMMANDS.reduce((acc, command) => {
  let callback = null;
  switch (command) {
    case "play":
      callback = ({ startTime, whenToPlay, selectedDancers }) => {
        axios.post(`/api/${command}`, {
          startTime,
          whenToPlay,
          selectedDancers,
        });
      };
      break;
    case "uploadControl":
      callback = ({ controlJson, selectedDancers }) => {
        console.log(controlJson);

        axios.post(`/api/${command}`, { controlJson, selectedDancers });
      };
      break;
    case "uploadLed":
      // ledData is an array
      callback = ({ ledData, selectedDancers }) => {
        axios.post(`/api/${command}`, { ledData, selectedDancers });
      };
      break;
    case "lightCurrentStatus":
      callback = ({ lightCurrentStatus, selectedDancers }) => {
        axios.post(`/api/${command}`, { lightCurrentStatus, selectedDancers });
      };
      break;
    default:
      callback = ({ selectedDancers }) => {
        axios.post(`/api/${command}`, { selectedDancers });
      };
      break;
  }
  return {
    ...acc,
    [command]: callback,
  };
}, {});
