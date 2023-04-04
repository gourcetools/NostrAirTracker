# NostrAirTracker
<img src="https://img.shields.io/badge/Tested%20under-Ubuntu%2022.04.1%20LTS-orange"> <img src="https://img.shields.io/badge/License-MIT-orange.svg"><br>

The application allows users to monitor a specified aircraft. <br>
Determine his status & publish accordingly to Nostr.<br>
No API keys needed. Simple setup.<br>


# <b>✔️ How to use NostrAirTracker?</b><br>
```
 git clone https://github.com/gourcetools/NostrAirTracker
 cd ./NostrAirTracker
 ./INSTALL.sh
 ./SETUP.sh
 ./START-CRAWLER.sh
```
And if you want to publish stuff to nostr, run 
```
 ./START-PUBLISHER.sh
```


![image](https://user-images.githubusercontent.com/120996278/225669565-7d060b15-9440-42d8-ae37-b0ae8dc6e179.png)


NostrAirTracker <br>
├── config <br>
│   ├── ICAO-ID.txt ``ICAO id that we will track`` <br>
│   ├── NOSTR-HEX-PRIVKEY.txt ``nostr key that we will use to publish`` <br>
│   └── PUP-BROWSER-LOCATION.txt ``path to the browser Puppeteer will use to crawl`` <br>
├── data <br>
│   └── airports.dat ``airports locations used to determine where the plane is`` <br>
├── INSTALL.sh ``script to install node and python stuff`` <br>
├── SETUP.sh  ``script to setup ICAO-ID, PRIVKEY and BROSWER LOCATION`` <br>
├── src <br>
│   ├── combine.py ``script to combine screenshots`` <br>
│   ├── crawled-position-to-airport.py ``script to convert position to airport name`` <br>
│   ├── crawl-position.js ``script to crawl position`` <br>
│   ├── crawl-speed-altitude-loop.js ``MAIN SCRIPT to to crawl data and determine plane status`` <br>
│   ├── nostr-publish-loop.sh  ``PUBLISHING SCRIPT that publish when status change`` <br>
│   └── screenshot.js ``script to take 2 screenshoots: one far away, one zoomed in`` <br>
├── START-CRAWLER.sh ``script to start the main crawler loop quickly.`` <br>
└── START-PUBLISHER.sh ``script to start the main publisher loop quickly.`` <br>


# Done:
- [x] 📡 Crawl:
          - Speed
          - Altitude
          - LastSeen
          - LAT & LONG (Position)         
- [x] 🧠 Determine: 
          - Plane status based on last data and freshly crawled data.
          - Airport name based on ``LAT`` & ``LONG``
- [x] 📢 Send status update to nostr network. | `KIND: 1
- [x] 📷 Take screenshoots.

# Todo:

- [ ] Simple shell Menu.
- [ ] Post screenshoots with status update.
- [ ] Use tor for crawling to avoid being blocked in the future.
- [ ] Remove completely nostr-publisher.sh and put it inside the main loop.
- [ ] Shell menu.
- [ ] Support for more relays, import relays list from a file in config folder instead of hardcoded variables.


# Problems:
- Written by me.


# <b>⚙️ Requirements:</b><br>

- `node`
- `npm` 
- `python` 
- `pip` 

- `nostril` : https://github.com/jb55/nostril



<br>



# 🙋‍♂️ Need help? <br> 
### <b>Telegram:</b> https://t.me/bitpaint <br>
### <b>Twitter:</b> https://twitter.com/bitpaintclub <br>
### <b>Nostr:</b> <br>
#### hex: 
``` 
0000005cc4586681ad8e7f4b75436fb7904b0e34ff072bb3406ddb90226d7eab 
``` 
#### npub: 
``` 
npub1qqqqqhxytpngrtvw0a9h2sm0k7gykr35lurjhv6qdhdeqgnd064swghgx4 
``` 
#### nip05: 
``` 
gourcetools@gourcetools.github.io 
```
