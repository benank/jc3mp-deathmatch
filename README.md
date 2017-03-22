# jc3mp-deathmatch
Simple arena-based deathmatch

## Installation

1. Run `npm install steam-web` inside the deathmatch package to install the required node module.
2. Replace "YOUR STEAM API KEY" inside `config.js` with [your steam API key](https://steamcommunity.com/dev/apikey).
3. Edit the rest of `config.js` as necessary. If you want to run it as a gamemode on a freeroam, 
set `integrated_mode` to true.

### Gameplay
 - Players are spawned randomly in an arena without any weapons.
 - Players must find weapons (they look like white circles with images in them) hidden in the arena.
 - Once a player dies, they are out of the round.
 - Weapons have different respawn times.
 - Game ends when there is one player remaining.
 - After the timer elapses, it resets to two minutes and the borders restrict gameplay to a small area in the center.
 - A new game begins only when the current one ends.
 - Each weapon spawn contains a random weapon of that type (ex. pistol spawns contain random types of pistols).

### Additional Notes

- Supported weathers for arenas: base, rain, overcast, thunderstorm, fog, snow, and random.
- There are 5 default arenas included.  Some arenas are better with more players.
- Requires [chat](https://gitlab.nanos.io/jc3mp-packages/chat).
- Requires [keypress](https://github.com/noobasaurus/jc3mp-keypress).
- Requires [TimeChange](https://github.com/noobasaurus/jc3mp-timechange).
- Highly recommended, but technically optional: [SyncTime](https://github.com/noobasaurus/jc3mp-synctime).

### Known Issues

- Players will retain their weapons through matches. Will be fixed when JC3MP 0.9.9 is released.
- Currently there is a hacky solution where everyone starts with weapons that have 0 ammo.
- Spectator: Health avatar is same as LocalPlayer
- Spectator: Pressing space does not switch spectated player.
- Spectator: Death sound is super loud.
- Spectator: Does not work at all if player was not in the game previously. Will be fixed in JC3MP 0.9.9.
- Sometimes weapon spawns do not appear.

 

### Todo

- Make TimeChange not required.
- Organize clientside code.
- Maybe add a small UI to display players in lobby for integrated mode.
- Put admin command to end game.
- Maybe more powerups, such as temporary invulnerability or radar.