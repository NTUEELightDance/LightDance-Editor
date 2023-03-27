#! /usr/bin/env bash

TIME=$1

pgrep 'afplay' | xargs kill
cd "$(dirname "$0")" || exit

while true; do
    # break if the current time is greater than TIME
    if [[ $(gdate +%s%N | cut -b1-13) -gt $TIME ]]; then
        break
    fi
done

afplay '../../files/music/2023.mp3' &
echo "start playing"
