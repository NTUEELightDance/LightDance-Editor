#! /usr/bin/env bash

TIME=$1
STARTTIME=$2

pgrep 'mpv' | xargs kill #  Linux: mpv / macOS: afplay
cd "$(dirname "$0")" || exit

while true; do
    # break if the current time is greater than TIME
    if [[ $(gdate +%s%N | cut -b1-13) -gt $TIME ]]; then #  Linux: date / macOS: gdate
        break
    fi
done

# mpv '../../files/music/0322.wav' --start=$STARTTIME &
echo "start playing"
