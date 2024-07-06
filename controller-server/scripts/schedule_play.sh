#! /usr/bin/env bash

TIME=$1
STARTTIME=$2

pgrep 'play' | xargs kill #  Linux: play (from sox) / macOS: afplay
cd "$(dirname "$0")" || exit

while true; do
    # break if the current time is greater than TIME
    if [[ $(date +%s%N | cut -b1-13) -gt $TIME ]]; then #  Linux: date / macOS: gdate
        break
    fi
done

play '../../files/music/2024EEcamp.mp3' trim $STARTTIME &
echo "start playing"
