import { SingleDancerControlType, ControlType } from "../types"
// Remember to modify this when Of (Of.json) Changes


// The following is only a test db, not the real version used in 2023 EE-Night
// OfJsonDB is fixed when controller server is running, NO client (e.g. RPi, Control Panel) would be able to modify ControlJsonDB
let OfJsonDB: {[key: string]: SingleDancerControlType[]} = {
    "Ray": [ // DancerName used as key for dictionary
        {
          "start": 0,
          "fade": true,
          "status": {
            "of1": [255, 255, 255, 10],
            "of2": [255, 255, 255, 10],
            "of3": [255, 255, 255, 10],
            "of4": [255, 255, 255, 10],
            "of5": [255, 255, 255, 10],
            "of6": [255, 255, 255, 10],
            "of7": [255, 255, 255, 10],
            "of8": [255, 255, 255, 10],
            "of9": [255, 255, 255, 10],
            "of10": [255, 255, 255, 10],
            "of11": [255, 255, 255, 10],
            "of12": [255, 255, 255, 10],
            "of13": [255, 255, 255, 10],
            "of14": [255, 255, 255, 10],
            "of15": [255, 255, 255, 10],
            "of16": [255, 255, 255, 10],
            "of17": [255, 255, 255, 10],
            "of18": [255, 255, 255, 10],
            "of19": [255, 255, 255, 10],
            "of20": [255, 255, 255, 10]
          }
        },
        {
          "start": 10000,
          "fade": true,
          "status": {
            "of1": [255, 255, 255, 0],
            "of2": [255, 255, 255, 0],
            "of3": [255, 255, 255, 0],
            "of4": [255, 255, 255, 0],
            "of5": [255, 255, 255, 0],
            "of6": [255, 255, 255, 0],
            "of7": [255, 255, 255, 0],
            "of8": [255, 255, 255, 0],
            "of9": [255, 255, 255, 0],
            "of10": [255, 255, 255, 0],
            "of11": [255, 255, 255, 0],
            "of12": [255, 255, 255, 0],
            "of13": [255, 255, 255, 0],
            "of14": [255, 255, 255, 0],
            "of15": [255, 255, 255, 0],
            "of16": [255, 255, 255, 0],
            "of17": [255, 255, 255, 0],
            "of18": [255, 255, 255, 0],
            "of19": [255, 255, 255, 0],
            "of20": [255, 255, 255, 0]
          }
        }
      ]
}

export { OfJsonDB }
    