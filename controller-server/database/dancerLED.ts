import { SingleDancerControlType, ControlType } from "../types"
// Remember to modify this when Of (Led.json) Changes

interface LedJsonType {
    [LedKey: string]: SingleDancerControlType[]
}


// The following is only a test db, not the real version used in 2023 EE-Night
// LedJsonDB is fixed when controller server is running, NO client (e.g. RPi, Control Panel) would be able to modify ControlJsonDB
let LedJsonDB: {[key: string]: LedJsonType} = {
    "Ray": {
        "led1": [
          {
            "start": 150,
            "fade": true,
            "status": [
                [40, 0, 0, 10],
                [40, 0, 0, 10],
                [40, 0, 0, 10],
                [40, 0, 0, 10]
            ]
          },
          {
            "start": 300,
            "fade": false,
            "status": [
                [0, 40, 0, 10],
                [0, 40, 0, 10],
                [0, 40, 0, 10],
                [0, 40, 0, 10]
            ]
          }
        ],
        "led2": [
          {
            "start": 0,
            "fade": true,
            "status": [
              [0, 0, 40, 10],
              [0, 0, 40, 10],
              [0, 0, 40, 10],
              [0, 0, 40, 10]
            ]
          },
          {
            "start": 300,
            "fade": false,
            "status": [
              [0, 0, 0, 10],
              [0, 0, 0, 10],
              [0, 0, 0, 10],
              [0, 0, 0, 10]
            ]
          }
        ],
        "led3": [
          {
            "start": 0,
            "fade": true,
            "status": [
              [40, 40, 40, 10],
              [40, 40, 40, 10],
              [40, 40, 40, 10],
              [40, 40, 40, 10]
            ]
          },
          {
            "start": 60,
            "fade": false,
            "status": [
              [0, 0, 0, 10],
              [0, 0, 0, 10],
              [0, 0, 0, 10],
              [0, 0, 0, 10]
            ]
          },
          {
            "start": 120,
            "fade": false,
            "status": [
              [40, 40, 40, 10],
              [40, 40, 40, 10],
              [40, 40, 40, 10],
              [40, 40, 40, 10]
            ]
          },
          {
            "start": 180,
            "fade": false,
            "status": [
              [0, 0, 0, 10],
              [0, 0, 0, 10],
              [0, 0, 0, 10],
              [0, 0, 0, 10]
            ]
          }
        ]
      }
}

export { LedJsonDB }
    