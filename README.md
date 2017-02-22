# jc3mp-deathmatch
Simple arena-based deathmatch

## Installation

1. Run `npm install steam-web` inside the deathmatch package to install the required node module.
2. Replace "YOUR STEAM API KEY" inside `config.js` with [your steam API key](https://steamcommunity.com/dev/apikey).
3. Edit the rest of `config.js` as necessary. If you want to run it as a gamemode on a freeroam, 
set `integrated_mode` to true.

### Additional Notes

- Supported weathers for arenas: base, rain, overcast, thunderstorm, fog, snow, and random.
- Players will retain their weapons through matches. This will be fixed when JC3MP 0.9.9 is released.
- Requires [chat](https://gitlab.nanos.io/jc3mp-packages/chat).
