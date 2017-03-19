# jc3mp-deathmatch
Simple arena-based deathmatch

## Installation

1. Run `npm install steam-web` inside the deathmatch package to install the required node module.
2. Replace "YOUR STEAM API KEY" inside `config.js` with [your steam API key](https://steamcommunity.com/dev/apikey).
3. Edit the rest of `config.js` as necessary. If you want to run it as a gamemode on a freeroam, 
set `integrated_mode` to true.

### Additional Notes

- Supported weathers for arenas: base, rain, overcast, thunderstorm, fog, snow, and random.
- There are 5 default arenas included.  Some arenas are better with more players.
- Requires [chat](https://gitlab.nanos.io/jc3mp-packages/chat).
- Requires [keypress](https://github.com/noobasaurus/jc3mp-keypress).
- Requires [TimeChange](https://github.com/noobasaurus/jc3mp-timechange).
- Highly recommended, but technically optional: [SyncTime](https://github.com/noobasaurus/jc3mp-synctime).

### Known Issues

- Players will retain their weapons through matches. This will be fixed when JC3MP 0.9.9 is released.
 - Currently there is a hacky solution where everyone starts with weapons that have 0 ammo.
- Spectating:
 - Health avatar is same as LocalPlayer
 - Usually does not work if you were not in the actual game and died. This will be fixed when JC3MP 0.9.9 is released.
 - It's super janky and jagged. Smoothing will be implemented soontm.
 - Spectating does not end when a game ends and bugs out UI for next game.
 - Pressing space does not switch spectated player.
 - Death sound is super loud.
- Sometimes weapon spawns do not appear.

 

### Todo

- Make TimeChange not required.
- Organize clientside code.
- Maybe add a small UI to display players in lobby for integrated mode.
- Put admin command to end game.
- Maybe more powerups, such as temporary invulnerability or radar.