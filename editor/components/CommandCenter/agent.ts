import axios from "axios";
import { COMMANDS } from "constants";

export default Object.values(COMMANDS).reduce((acc, command) => {
  let callback = null;
  switch (command) {
    case COMMANDS.PLAY:
      callback = ({ startTime, delay, sysTime, selectedDancers }) => {
        axios.post(`/api/controller/${command}`, {
          args: { startTime, delay, sysTime },
          selectedDancers,
        });
      };
      break;
    case COMMANDS.UPLOAD_CONTROL:
      callback = ({ controlJson, selectedDancers }) => {
        axios.post(`/api/controller/${command}`, {
          args: { controlJson },
          selectedDancers,
        });
      };
      break;
    case COMMANDS.UPLOAD_LED:
      callback = ({ selectedDancers }) => {
        axios.post(`/api/controller/${command}`, { args: {}, selectedDancers });
      };
      break;
    case COMMANDS.LIGTHCURRENTSTATUS:
      callback = ({ lightCurrentStatus, selectedDancers }) => {
        axios.post(`/api/controller/${command}`, {
          args: { lightCurrentStatus },
          selectedDancers,
        });
      };
      break;
    default:
      callback = ({ selectedDancers }) => {
        axios.post(`/api/controller/${command}`, { args: {}, selectedDancers });
      };
      break;
  }
  return {
    ...acc,
    [command]: callback,
  };
}, {});
