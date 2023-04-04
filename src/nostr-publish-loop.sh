#!/bin/bash
# Configuration
RELAY="wss://nostr.mutinywallet.com"
RELAYBIS="wss://relay.nostr.band"
RELAYFALLBACK="wss://nostr-pub.wellordered.net"
PRIVKEY=$(cat ../config/NOSTR-HEX-PRIVKEY.txt)
POW=10


# Data
STATUS=$(cat ../data/STATUS.txt 2>/dev/null)
AIRPORT=$(cat ../data/AIRPORT.txt 2>/dev/null)
LASTAIRPORT=$(cat ../data/AIRPORT.txt 2>/dev/null)
MESSAGE=$(cat ../data/MESSAGE.txt 2>/dev/null)

echo "Waiting for status change to publish..."

# Loop
while true
do
  NEW_STATUS=$(cat ../data/STATUS.txt)
  

  if [ "$STATUS" != "$NEW_STATUS" ]; then
    echo "=> Status changed from "$STATUS" to "$NEW_STATUS" ."
    STATUS="$NEW_STATUS"
    

    if [ "$STATUS" == "Landed" ]; then
     echo "Landed... checking position with ./crawl-position.js "
      node crawl-position.js
     echo "Converting position to airport name with crawled-position-to-airport.py"
      python3 crawled-position-to-airport.py

     AIRPORT=$(cat ../data/AIRPORT.txt)
     LASTAIRPORT=$(cat ../data/AIRPORT.txt)
     echo "==================================================="
     echo " 🛬📍 Landed at "$AIRPORT" " > ../data/MESSAGE.txt
     echo "==================================================="
     MESSAGE=$(cat ../data/MESSAGE.txt)
     echo "$MESSAGE"
     nostril --envelope --pow "$POW" --sec "$PRIVKEY" --content "$MESSAGE" | tee >(websocat $RELAY) >(websocat $RELAYBIS) >(websocat $RELAYFALLBACK)  

     elif [ "$STATUS" == "Took Off" ]; then
     cp ../data/AIRPORT.txt ../data/LAST-AIRPORT.txt
     AIRPORT=$(cat ../data/AIRPORT.txt)
     echo "==================================================="
     echo " 🛫 Took Off from "$AIRPORT"." > ../data/MESSAGE.txt
     echo "==================================================="
     MESSAGE=$(cat ../data/MESSAGE.txt)
     echo "$MESSAGE"
     nostril --envelope --pow "$POW" --sec "$PRIVKEY" --content "$MESSAGE" | tee >(websocat $RELAY) >(websocat $RELAYBIS) >(websocat $RELAYFALLBACK)  


    elif [ "$STATUS" == "Parked" ]; then
      AIRPORT=$(cat ../data/AIRPORT.txt)
        echo "Parked."


    elif [ "$STATUS" == "Flying" ]; then
      echo "Flying. "
    fi

  fi
  
  sleep 5
  
done
