#!/bin/bash

START_IP=100
END_IP=126
SUBNET="192.168.0"

echo "Scanning SSH connectivity from ${SUBNET}.${START_IP} to ${SUBNET}.${END_IP}"

for i in $(seq $START_IP $END_IP); do
    IP="${SUBNET}.${i}"
    if ping -c 1 -W 1 "$IP" > /dev/null 2>&1; then
        echo "Checking SSH connectivity to ${IP}"
        if nc -z -w 1 "$IP" 22; then
            echo -e "SSH Host ${IP} is reachable"
        else
            echo -e "SSH Host ${IP} is not reachable"
        fi
    else
        echo "Host ${IP} is not reachable"
    fi
done