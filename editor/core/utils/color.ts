import _ from "lodash";

/**
 * deleteColorCode return status without colorCode
 * @param {object} status - target status
 */
export function deleteColorCode(status) {
  const pureStatus = _.cloneDeep(status);

  Object.keys(status).forEach((name) => {
    const dancer = status[name];
    Object.keys(dancer).forEach((partName) => {
      const part = dancer[partName];
      if (part["colorCode"]) delete pureStatus[name][partName]["colorCode"];
    });
  });
}
