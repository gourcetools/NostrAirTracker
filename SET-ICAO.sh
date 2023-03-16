#!/bin/bash
echo "==============="
echo " ICAO ID SETUP"
echo ""===============""
echo " Example: "
echo "👉 For: https://globe.theairtraffic.com/?icao=a8cc46 "
echo "👉 You need to enter: a8cc46 "
echo " "
echo "=========="
echo " ICAO ID?"
read icaoid
echo "$icaoid" > ./config/ICAO-ID.txt

echo "✅ $icaoid defined as ICAO-ID in ./config/ICAO-ID.txt "