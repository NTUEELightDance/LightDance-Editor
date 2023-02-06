# Controller server

Responsible for communicating to the remote hardware.

## Run

Run on `http://localhost:8082` as default.

```
pnpm start
```

## Test

To test controller-server, run
```
yarn dev:controller-server
```
under the Lightdance-Editor folder

To setup a test RPi Client, run **under the controller-server folder**
```
yarn test-rpi
```

To setup a test Contrtol Panel Client, run **under the controller-server folder**
```
yarn test-control
```

It is recommended that you setup the test RPi client before running the test Control Panel Client

## Command list
```
    const SYNC = "sync";
    const UPLOAD_LED = "uploadLed";
    const UPLOAD_OF = "uploadOf";
    const LOAD = "load";
    const PLAY = "play";
    const PAUSE = "pause";
    const STOP = "stop";
    const LIGTHCURRENTSTATUS = "lightCurrentStatus";
    const KICK = "kick";
    const SHUTDOWN = "shutDown";
    const REBOOT = "reboot";
    const BOARDINFO = "boardInfo";
    const INIT = "init";
    const TEST = "test";

    const COMMANDS = {
        SYNC,
        UPLOAD_LED,  // need payload, type is ControlType
        UPLOAD_OF,  // need payload, type is ControlType
        LOAD,
        PLAY,  
        PAUSE,
        STOP,
        LIGTHCURRENTSTATUS,  // need payload
        KICK,
        SHUTDOWN,
        REBOOT,
        BOARDINFO,  // need payload  no button
        INIT,
        TEST  // need payload
    };
```

Modify the command and payload under testControlPanel1.js to test each command.
[Note] The command BOARDINFO is the initializing command and must be sent as the first command.

## Payload type explanation
```
// Payload for Play command
interface PlayTimeType {
  startTime: number,  // ms
  delay: number,  // ms
  sysTime: number  // ms, unix time stamp
}

// Payload for Boardinfo Command
interface InfoType {
	type: string,  // ex.RPI
	dancerName?: string,  // only needed when type is RPI
	ip?: string,  // only needed when type is RPI
	hostName?: string  // only needed when type is RPI
}

// Payload for UploadLed and UploadOf Command
[
	{
	  "start": 0, // ms
	  "fade": true,
	  "status": {
			"Calf_R": [255, 255, 255, 10], // r, g, b, a
	    "Thigh_R": [255, 255, 255, 10],
	    "LymphaticDuct_R": [255, 255, 255, 10],
	    "Waist_R": [255, 255, 255, 10],
	    "Arm_R": [255, 255, 255, 10],
	    "Shoulder_R": [255, 255, 255, 10],
	    "CollarBone_R": [255, 255, 255, 10],
	    "Chest": [255, 255, 255, 10],
	    "Visor": [255, 255, 255, 10],
	    "Ear_R": [255, 255, 255, 10],
	    "Calf_L": [255, 255, 255, 10],
	    "Thigh_L": [255, 255, 255, 10],
	    "LymphaticDuct_L": [255, 255, 255, 10],
	    "Waist_L": [255, 255, 255, 10],
	    "CollarBone_L": [255, 255, 255, 10],
	    "Arm_L": [255, 255, 255, 10],
	    "Ear_L": [255, 255, 255, 10],
	    "Shoulder_L": [255, 255, 255, 10],
	    "Glove_L": [255, 255, 255, 10],
	    "Glove_R": [255, 255, 255, 10]
	  }
	},
	...
]
```
