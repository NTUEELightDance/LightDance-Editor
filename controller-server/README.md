# Controller Server

## Config

The configuation for pinMapTable and dancerTable is in `configs/`.

## Message Format
* Example Message from RPi
```json
{
    "from": "RPi",
    "topic": "boardInfo",
    "statusCode": 0,
    "payload": {
        "MAC": "00:00:00:00:00:00"
    }
}
```

* Example Message from Control Panel
```json
{
    "from": "controlPanel",
    "topic": "play",
    "statusCode": 0,
    "payload": {
        "dancer": ["6_stantheman"],
        "start": 1000,
        "delay": 5000,
    }
}
```

* Example Message from Server
```json
{
    "from": "server",
    "topic": "play",
    "statusCode": 0,
    "payload": {
        "dancer": ["6_stantheman"],
        "start": 1000,
        "delay": 5000,
    }
}
```

## RPi
### From

* boardInfo
```json
{
    "from": "RPi",
    "topic": "boardInfo",
    "statusCode": 0,
    "payload": {
        "MAC": "00:00:00:00:00:00"
    }
}
```

* command Response
```json
{
    "from": "RPi",
    "topic": "command",
    "statusCode": -1,
    "payload": {
        "MAC": "00:00:00:00:00:00",
        "command": "playerctl stop",
        "message": "[Error]: mock error message"
    }
}
```


## To
* upload
```json
{
    "from": "RPi",
    "topic": "upload",
    "statusCode": 0,
    "payload": [pinMap, OF, LED]
}
```

* play
```json
{
    "from": "RPi",
    "topic": "command",
    "statusCode": 0,
    "payload": ["playerctl", "play", 4000, "-d", 5000]
}
```

* pause
```json
{
    "from": "RPi",
    "topic": "command",
    "statusCode": 0,
    "payload": ["playerctl", "pause"]
}
```

* stop
```json
{
    "from": "RPi",
    "topic": "command",
    "statusCode": 0,
    "payload": ["playerctl", "stop"]
}
```

* list
```json
{
    "from": "RPi",
    "topic": "command",
    "statusCode": 0,
    "payload": ["list"]
}
```

* load
```json
{
    "from": "RPi",
    "topic": "command",
    "statusCode": 0,
    "payload": ["load"]
}
```

* LED test
```json
{
    "from": "RPi",
    "topic": "command",
    "statusCode": 0,
    "payload": ["ledtest", "--hex", "ffffff"]
}
```

* Fiber test
```json
{
    "from": "RPi",
    "topic": "command",
    "statusCode": 0,
    "payload": ["oftest", "--hex", "ffffff"]
}
```

## Control Panel
### From

* boardInfo
```json
{
    "from": "controlPanel",
    "topic": "boardInfo",
    "statusCode": 0,
}
```

* play
```json
{
    "from": "RPi",
    "topic": "play",
    "statusCode": 0,
    "payload": {
        "dancers": ["6_stantheman", ],
        "start": 4000,
        "delay": 5000
}
```
* pause
```json
{
    "from": "RPi",
    "topic": "pause",
    "statusCode": 0,
    "payload": {
        "dancers": ["6_stantheman", ],
}
```

* stop
```json
{
    "from": "RPi",
    "topic": "stop",
    "statusCode": 0,
    "payload": {
        "dancers": ["6_stantheman", ],
}
```

* upload
```json
{
    "from": "RPi",
    "topic": "upload",
    "statusCode": 0,
    "payload": {
        "dancers": ["6_stantheman"]
    }
}
```

* load
```json
{
    "from": "RPi",
    "topic": "load",
    "statusCode": 0,
    "payload": {
        "dancers": ["6_stantheman"]
    }
}
```

* test
```json
{
    "from": "RPi",
    "topic": "test",
    "statusCode": 0,
    "payload": {
        "dancers": ["6_stantheman", ],
        "colorCode": "#ffffff"
    }
}
```

* red
```json
{
    "from": "RPi",
    "topic": "red",
    "statusCode": 0,
    "payload": {
        "dancers": ["6_stantheman", ],
    }
}
```

* green
```json
{
    "from": "RPi",
    "topic": "green",
    "statusCode": 0,
    "payload": {
        "dancers": ["6_stantheman", ],
    }
}
```

* blue
```json
{
    "from": "RPi",
    "topic": "blue",
    "statusCode": 0,
    "payload": {
        "dancers": ["6_stantheman", ],
    }
}
```

* darkall
```json
{
    "from": "RPi",
    "topic": "darkAll",
    "statusCode": 0,
}
```