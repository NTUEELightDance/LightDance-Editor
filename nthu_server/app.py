from flask import Flask, request
import time

import serial

import argparse

app = Flask(__name__)

@app.route("/api/nthu_play")
def nthu_play():
    sys_time = int(request.args.get('sys_time'))
    while ((time.time() * 1000) < (sys_time - 500)):
        time.sleep(0.0001)
    
    send_time = time.time() * 1000
    print("Send Serial at %d, delta: %d" % (send_time, send_time - sys_time))
    start(com)
    return ("Play at system time: %d" % send_time)

@app.route("/api/nthu_stop")
def nthu_stop():
    stop(com)
    return ("Stop at system time: %d" % time.time())

def start(com) :
  str = 'start\n'
  print(com.write(str.encode()))

def stop(com) :
    string = 'stop\n'
    com.write(string.encode())

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--tty",
                        default="/dev/tty.usbserial-0001",
                        help="Use ls `/dev/tty.usb* to` find the right tty port",
                        required=True)
    args = parser.parse_args()
    com = serial.Serial(args.tty, 115200) # '/dev/tty.usbserial-10' 要依據電腦上連接的 Arduino 裝置來改    print("Using tty port: %s" % args.tty)
    time.sleep(1)
    app.run(debug=True)