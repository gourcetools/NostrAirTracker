#!/bin/bash
# Configuration
RELAY="wss://nostr.mutinywallet.com"
RELAY_B="wss://relay.nostr.band"
RELAY_C="wss://relay.damus.io/"
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
     echo "==================================================="
    echo "= STATUS HAS  CHANGED "
    echo "= from: "$STATUS" "
    echo "= to:   "$NEW_STATUS"."
     echo "==================================================="

    
    # LANDED, then:
    STATUS="$NEW_STATUS"
    # If the new status is: 
    if [ "$STATUS" == "Landed" ]; then
     echo "Checking position with ./crawl-position.js "
     node crawl-position.js
     echo "Converting position to airport name with crawled-position-to-airport.py"
     python3 crawled-position-to-airport.py

     AIRPORT=$(cat ../data/AIRPORT.txt)
     LASTAIRPORT=$(cat ../data/AIRPORT.txt)
     echo " 🏁 Landed at "$AIRPORT" " > ../data/MESSAGE.txt
     # Take a screenshots and combine them, them upload the image and add it to the message.
     node screenshot-taker.js
     python3 screenshot-combiner.py
     ./screenshot-uploader.sh

     echo "==================================================="
     MESSAGE=$(cat ../data/MESSAGE.txt)
     echo "$MESSAGE"
     echo "==================================================="

     nostril --envelope --pow "$POW" --sec "$PRIVKEY" --content "$MESSAGE" | tee >(websocat $RELAY) >(websocat $RELAY_B) >(websocat $RELAY_C)  
    # TOOK OFF, then:
    elif [ "$STATUS" == "Took Off" ]; then
      cp ../data/AIRPORT.txt ../data/LAST-AIRPORT.txt
      AIRPORT=$(cat ../data/AIRPORT.txt)
      # Take a screenshots and combine them, them upload the image and add it to the message.
      echo " 🚀 Took Off from "$AIRPORT"." > ../data/MESSAGE.txt
      node screenshot-taker.js
      python3 screenshot-combiner.py
      ./screenshot-uploader.sh
      echo "==================================================="
      MESSAGE=$(cat ../data/MESSAGE.txt)
      echo "$MESSAGE"
      echo "==================================================="
      nostril --envelope --pow "$POW" --sec "$PRIVKEY" --content "$MESSAGE" | tee >(websocat $RELAY) >(websocat $RELAY_B) >(websocat $RELAY_C)  

    # PARKED, then:
    elif [ "$STATUS" == "Parked" ]; then
      AIRPORT=$(cat ../data/AIRPORT.txt)
      echo "Parked."
      # nostril --envelope --pow "$POW" --sec "$PRIVKEY" --content "Parked." | tee >(websocat $RELAY) >(websocat $RELAY_B) >(websocat $RELAY_C)  

    # FLYING, then:
    elif [ "$STATUS" == "Flying" ]; then
      echo "Flying. "
      # nostril --envelope --pow "$POW" --sec "$PRIVKEY" --content "Flying." | tee >(websocat $RELAY) >(websocat $RELAY_B) >(websocat $RELAY_C)  
    fi

  fi

  sleep 5
  
done
