import csv
import math
import os
import pycountry

# Read the LAT and LONG values from the files
with open('../data/LAT.txt') as f:
    LAT = float(f.read().strip())
with open('../data/LONG.txt') as f:
    LONG = float(f.read().strip())

def distance(lat1, lon1, lat2, lon2):
    # Calculate the distance between two points using the Haversine formula
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    # Haversine formula
    dlat = lat2 - lat1 
    dlon = lon2 - lon1 
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a)) 
    r = 6371 # Radius of earth in kilometers. Use 3956 for miles
    return c * r

def closest_airport(lat, lon):
    # Read airport data from CSV file
    airports = []
    with open('../data/airports.dat', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            airports.append(row)
    # Find the closest airport
    closest = None
    min_dist = float('inf')
    for airport in airports:
        airport_lat, airport_lon = float(airport[6]), float(airport[7])
        dist = distance(lat, lon, airport_lat, airport_lon)
        if dist < min_dist:
            min_dist = dist
            closest = airport
    return closest

def country_flag(country_name):
    country = pycountry.countries.get(name=country_name)
    if country:
        alpha_2 = country.alpha_2
        flag = ''.join(chr(ord(c) + 127397) for c in alpha_2.upper())
        return flag
    else:
        return ""

closest = closest_airport(LAT, LONG)
airport_name = closest[1]
city = closest[2]
country = closest[3]
flag = country_flag(country)

with open('../data/AIRPORT.txt', 'w') as f:
    f.write(f"{airport_name} - {country} {flag}")
