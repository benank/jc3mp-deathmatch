module.exports = 

class Deathmatch
{
    constructor(players, data)
    {
        this.players = players;
        this.playerSpawnPoints = JSON.parse(JSON.stringify(data.playerSpawnPoints)); // Copy method
        this.weaponSpawnPoints = JSON.parse(JSON.stringify(data.weaponSpawnPoints));
        this.defaults = JSON.parse(JSON.stringify(data.defaults));
        this.timeouts = [];
        this.current_time = this.defaults.max_time;
        this.active = false;
        this.showdown_mode = false;
        this.lang = require('./lang');
        this.gm = require('./gameManager');
        this.dead = []; // Keep track of dead people so spectators can know
        this.spectators = []; // Keep track of spectators so we can send them stuff
        this.winner_announced = false;
    }

    start() // Initializes all game stuff but does not start game or countdown
    {
        console.log("[DEATHMATCH] A game has started");
        if (this.defaults.weather == "random")
        {
            this.defaults.weather = ['base','rain','overcast','thunderstorm','fog','snow'][Math.floor(Math.random() * 6)];
        }

        let available_spawns = JSON.parse(JSON.stringify(this.playerSpawnPoints));

        this.players.forEach(player =>
        {
            player.dm.dimension = player.dimension;
            player.dm.position = player.position;
            jcmp.events.CallRemote('InitializeDefaults', player, JSON.stringify(this.defaults));
            jcmp.events.CallRemote('InitializeWeaponSpawns', player, JSON.stringify(this.weaponSpawnPoints));
            let spawn_index = Math.round(Math.random() * (available_spawns.length - 1))
            let data;
            if (available_spawns.length == 0) // If we have run out of unique spawns, take random ones
            {
                data = this.playerSpawnPoints[Math.round(Math.random() * (this.playerSpawnPoints.length - 1))];
            }
            else
            {
                data = available_spawns.splice(spawn_index, 1)[0];
            }
            // Use random offets in case there are two people in one spawn
            let pos = new Vector3f(data.x + this.get_random_adjust(3), data.y + 2, data.z + this.get_random_adjust(3));
            player.health = 800;
            player.respawnPosition = pos;
            player.dimension = (dm.config.integrated_mode) ? dm.config.integrated_settings.dimension : 0;

            player.Respawn();
            jcmp.events.CallRemote('SteamAvatarURLUpdate', player, JSON.stringify(dm.avatars));
            jcmp.events.Call('ChangeTime', this.defaults.time.minute, this.defaults.time.hour);

            // Hacky weapon "removal" until 0.9.9
            player.GiveWeapon(2307691279, 0, true);
            player.GiveWeapon(3923877588, 0, true);
            player.GiveWeapon(2144721124, 0, true);

            player.GiveWeapon(1394636892, 0, true);
            player.GiveWeapon(2042423840, 0, true);
            player.GiveWeapon(89410586, 0, true);
            
        });

        if (!dm.config.integrated_mode)
        {
            jcmp.events.CallRemote('SyncPlayersIngame', null, this.players.length);
        }
    }

    begin_game() // Actually begins the game after players have loaded
    {
        //console.log("BEGIN GAME");
        this.players.forEach(player => 
        {
            player.invulnerable = false;
            // Set the player's dimension again because it might fix a rare bug where players dont see each other
            player.dimension = (dm.config.integrated_mode) ? dm.config.integrated_settings.dimension : 0;
            jcmp.events.CallRemote('CountDownStart', player, 10);
            let timeout = setTimeout(() =>
            {
                player.position = player.respawnPosition; // Teleport them to their position again to make sure they dont freeze
            }, 9000);
        });
        this.active = true;
        this.start_timeouts();
    }

    start_timeouts()
    {
        let timeout = setTimeout(() =>
        {
            this.broadcast_border_shrink();
            let timeout = setTimeout(() =>
            {
                this.tie_game();
            }, this.defaults.showdown_time * 1000);
            this.timeouts.push(timeout);
        }, this.defaults.max_time * 1000 + 10000); // +10 seconds because of wait time at the beginning
        this.timeouts.push(timeout);
    }

    end()
    {
        console.log("[DEATHMATCH] A game has ended");
        
        this.timeouts.forEach(timeout =>
        {
            clearTimeout(timeout); // Clear all active timeouts
        });
        if (!dm.config.integrated_mode)
        {
            jcmp.events.CallRemote('SyncPlayersIngame', null, 0);
        }
        this.active = false;

    }

    pickup_weapon(player, index)
    {
        let weapon_spawn = this.weaponSpawnPoints[index];
        if (weapon_spawn == null || weapon_spawn.disabled == true)
        {
            return;
        }

        let weapons = this.defaults.weapons[weapon_spawn.type];
        let weapon = weapons[Math.floor(Math.random() * weapons.length)];
        player.GiveWeapon(weapon.hash, Math.ceil(Math.random() * (weapon.max_ammo - weapon.min_ammo) + weapon.min_ammo), true);
        this.broadcast_weap_take(index);
        this.weaponSpawnPoints[index].disabled = true;
        const respawn_time = weapon.respawn_time * 1000 * 60;
        jcmp.events.Call('WeaponTimeoutRespawn', index, respawn_time);

    }

    broadcast_border_shrink()
    {
        this.players.forEach(player =>
        {
            jcmp.events.CallRemote('BorderShrink', player, this.defaults.diameter / 15, this.defaults.showdown_time);
            this.lang.send(player, this.lang.formatMessage(this.lang.msgs.on_border_shrink, {}))
        });
        jcmp.events.CallRemote('BorderShrinkSpectator', null, this.defaults.showdown_time);
    }
    
    broadcast_weap_respawn(index)
    {
        this.weaponSpawnPoints[index].disabled = false;
        this.players.forEach(player =>
        {
            jcmp.events.CallRemote('WeaponRespawn', player, index);
        });

        this.spectators.forEach(player =>
        {
            jcmp.events.CallRemote('WeaponRespawn', player, index);
        });
    }

    broadcast_weap_take(index)
    {
        this.players.forEach(player =>
        {
            jcmp.events.CallRemote('WeaponTake', player, index);
        });

        this.spectators.forEach(player =>
        {
            jcmp.events.CallRemote('WeaponTake', player, index);
        });
    }

    player_won(player)
    {
        jcmp.events.CallRemote('ShowDeathScreen', player, 1, false);
        let timeout = setTimeout(() => 
        {
            jcmp.events.CallRemote('EndGame', player);
            player.invulnerable = true;
            if (dm.config.integrated_mode)
            {
                player.respawnPosition = player.dm.position;
            }
            player.Respawn();
            player.dimension = (dm.config.integrated_mode) ? player.dm.dimension : 1;
            this.remove_player(player, true);
            if (!this.winner_announced)
            {
                this.lang.broadcast(this.lang.formatMessage(this.lang.msgs.on_ended, {winner: player.name}));
                this.winner_announced = true;
            }
        }, 5000);
        this.timeouts.push(timeout);
    }

    player_died(player)
    {
        jcmp.events.CallRemote('ShowDeathScreen', player, this.players.length, false);
        this.remove_player(player);
        let timeout = setTimeout(() => 
        {
            jcmp.events.CallRemote('EndGame', player);
            player.invulnerable = true;
            if (dm.config.integrated_mode)
            {
                player.respawnPosition = player.dm.position;
            }
            player.Respawn();
            player.dimension = (dm.config.integrated_mode) ? player.dm.dimension : 1;
        }, 5000);
        this.timeouts.push(timeout);

        if (this.players.length == 0) // Everyone died
        {
            this.lang.broadcast(this.lang.formatMessage(this.lang.msgs.on_ended_die, {}));
            this.winner_announced = true;
        }
        
    }

    tie_game()
    {
        this.lang.broadcast(this.lang.formatMessage(this.lang.msgs.on_ended_tie, {num_players: this.players.length}));
        this.gm.StopGame();
        this.timeouts.push(timeout);
    }

    player_tied(player)
    {
        player.invulnerable = true;
        jcmp.events.CallRemote('ShowDeathScreen', player, 1, true);
        let timeout = setTimeout(() =>  
        {
            jcmp.events.CallRemote('EndGame', player);
            jcmp.events.CallRemote('CleanupIngameUI', player);
            player.invulnerable = true;
            if (dm.config.integrated_mode)
            {
                player.respawnPosition = player.dm.position;
            }
            player.Respawn();
            player.dimension = (dm.config.integrated_mode) ? player.dm.dimension : 1;
            this.remove_player(player, true);
        }, 5000);
        this.timeouts.push(timeout);
    }

    remove_player(player, keep_avatar) // Sync it to everyone when number of ingame players changes
    {
        this.check_for_nulls();
        const player_exists = this.players.find(p => p.networkId == player.networkId);
        if (!keep_avatar && typeof player_exists != 'undefined') // If we don't want the avatar to stay and WANT to X it out
        {
            this.dead.push(player.networkId);
            this.players.forEach(p => 
            {
                jcmp.events.CallRemote('PlayerDiedDeathmatch', p, player.networkId);
            });

            this.spectators.forEach(p => 
            {
                // Spectators will automatically switch when a player dies if they are spectating them
                jcmp.events.CallRemote('PlayerDiedDeathmatch', p, player.networkId);
            });
        }

        this.check_for_nulls();
        this.players = this.players.filter(p => p.networkId != player.networkId);
        if (!dm.config.integrated_mode && typeof player_exists != 'undefined')
        {
            jcmp.events.CallRemote('SyncPlayersIngame', null, this.players.length);
        }
    }

    decrease_time()
    {
        this.current_time = (this.current_time <= 0) ? 0 : this.current_time - 1;
        if (this.current_time <= 0 && this.active && !this.showdown_mode)
        {
            this.current_time = this.defaults.showdown_time;
            this.showdown_mode = true;
        }
    }

    get_num_loaded()
    {
        let loaded = 0;
        this.players.forEach(player =>
        {
            if (!player.dm.teleporting)
            {
                loaded++;
            }
        });
        return loaded;
    }

    get_random_adjust(num)
    {
        return (Math.random() > 0.5) ? - Math.random() * num : Math.random() * num;
    }

    check_for_nulls() // Makes sure that arrays of players don't bug out and contain bad things
    {
        this.players = this.players.filter(p => typeof p != 'undefined');
        this.spectators = this.spectators.filter(p => typeof p != 'undefined');
    }


}