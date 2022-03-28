from flask import Flask, request

import time
import serial
import argparse

def start(com) :
    string = 'start\n'
    com.write(string.encode())

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
    com = serial.Serial(args.tty, 115200) # '/dev/tty.usbserial-10' 要依據電腦上連接的 Arduino 裝置來改
    
    time.sleep(1)

    print(com)
    print("Using tty port: %s" % args.tty)
    while(True):
        command = input()
        print(command)
        if command == "start":
            start(com)
        elif command == "stop":
            stop(com)