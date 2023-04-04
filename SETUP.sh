#!/bin/bash
echo "==============="
echo " ICAO ID SETUP"
echo ""===============""
echo " Example: "
echo "👉 For: https://globe.theairtraffic.com/?icao=a8cc46"
echo "👉 You need to enter: a8cc46 "
echo " "
echo "=========="
echo " ICAO ID?"
read icaoid
echo "$icaoid" > ./config/ICAO-ID.txt

echo "✅ $icaoid defined as ICAO-ID in ./config/ICAO-ID.txt"

echo "==============="
echo " BROWSER SETUP"
echo ""===============""
echo " Example: "
echo "👉 /usr/bin/google-chrome "
echo " "
echo "=========="
echo " BROWSER EXECUTABLE?"
read browser
echo "$browser" > ./config/PUP-BROWSER-LOCATION.txt

echo "✅ $browser defined as BROWSER PATH in ./config/PUP-BROWSER-LOCATION.txt"


echo "==============="
echo " NOSTR HEX PRIVKEY SETUP"
echo "==============="
echo " Example: "
echo "👉 4c2d5923056ed9a19594e9e2a8589eef308c3563501f9779c488984d39eadbcf"
echo " "
echo "=========="
echo " NOSTR HEX PRIVKEY ?"
read key
echo "$key" > ./config/NOSTR-HEX-PRIVKEY.txt

echo "✅ $key defined as NOSTR-HEX-PRIVKEY in ./config/NOSTR-HEX-PRIVKEY.txt"