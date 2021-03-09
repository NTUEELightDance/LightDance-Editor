import axios from "axios";
import * as CONSTANT from "../../constants";

export default CONSTANT.COMMANDS.reduce((acc, command) => {
  let callback = null;
  switch (command) {
    case CONSTANT.PLAY:
      callback = ({ startTime, delay, selectedDancers }) => {
        axios.post(`/api/${command}`, {
          args: { startTime, delay },
          selectedDancers,
        });
      };
      break;
    case CONSTANT.UPLOAD_CONTROL:
      callback = ({ controlJson, selectedDancers }) => {
        console.log(controlJson);

        axios.post(`/api/${command}`, {
          args: { controlJson },
          selectedDancers,
        });
      };
      break;
    case CONSTANT.UPLOAD_LED:
      // ledData is an array
      callback = ({ ledData, selectedDancers }) => {
        axios.post(`/api/${command}`, { args: { ledData }, selectedDancers });
      };
      break;
    case CONSTANT.LIGTHCURRENTSTATUS:
      callback = ({ lightCurrentStatus, selectedDancers }) => {
        axios.post(`/api/${command}`, {
          args: { lightCurrentStatus },
          selectedDancers,
        });
      };
      break;
    default:
      callback = ({ selectedDancers }) => {
        axios.post(`/api/${command}`, { args: {}, selectedDancers });
      };
      break;
  }
  return {
    ...acc,
    [command]: callback,
  };
}, {});
