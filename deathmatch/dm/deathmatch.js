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
    }




    start()
    {
        console.log("GAME START");
        this.players.forEach(player =>
        {
            jcmp.events.CallRemote('InitializeDefaults', player, JSON.stringify(this.defaults));
            jcmp.events.CallRemote('InitializeWeaponSpawns', player, JSON.stringify(this.weaponSpawnPoints));
            let data = this.playerSpawnPoints[Math.round(Math.random() * (this.playerSpawnPoints.length - 1))];
            let pos = new Vector3f(data.x, data.y, data.z);
            player.health = 800;
            player.respawnPosition = pos;
            player.dimension = 0;
            player.Respawn();
            player.invulnerable = false;
            jcmp.events.CallRemote('CountDownStart', player, 10);
            jcmp.events.Call('ChangeTime', this.defaults.time.minute, this.defaults.time.hour)
        });
        jcmp.events.CallRemote('SyncPlayersIngame', null, this.players.length);
        this.active = true;
    }

    end()
    {
        console.log("GAME END");
        if (this.players.length > 0)
        {
            this.players.forEach(function(player) 
            {
                jcmp.events.CallRemote('EndGame', player);
                player.Respawn();
                player.invulnerable = true;
            });
        }
        this.timeouts.forEach(function(timeout) 
        {
            clearTimeout(timeout); // Clear all active timeouts
        });
        jcmp.events.CallRemote('SyncPlayersIngame', null, 0);
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
        // BIG NOTE HERE - cannot use 'this' either in for loops or in callremote - weird, maybe im just dumb
        const showdown_time = this.defaults.showdown_time;
        const diameter = this.defaults.diameter / 15;
        const chat = jcmp.events.Call('get_chat')[0];
        this.players.forEach(function(player) 
        {
            jcmp.events.CallRemote('BorderShrink', player, diameter, showdown_time);
            chat.send(player, "[#FF0000][Deathmatch][#33FF81] The borders are closing in! Head to the center of the arena quickly!", new RGBA(255,255,255));
        });
    }
    
    broadcast_weap_respawn(index)
    {
        this.weaponSpawnPoints[index].disabled = false;
        this.players.forEach(function(player) 
        {
            jcmp.events.CallRemote('WeaponRespawn', player, index);
        });
    }

    broadcast_weap_take(index)
    {
        this.players.forEach(function(player) 
        {
            jcmp.events.CallRemote('WeaponTake', player, index);
        });
    }

    player_won(player)
    {
        jcmp.events.CallRemote('ShowDeathScreen', player, this.players.length, false);
        jcmp.events.CallRemote('CleanupIngameUI', player);
        let timeout = setTimeout(function() 
        {
            jcmp.events.CallRemote('EndGame', player);
            player.Respawn();
            player.invulnerable = true;
            player.dimension = 1;
        }, 5000);
        this.timeouts.push(timeout);
        jcmp.events.CallRemote('SyncPlayersIngame', null, this.players.length);
    }

    player_died(player)
    {
        jcmp.events.CallRemote('ShowDeathScreen', player, this.players.length, false);
        this.remove_player(player);
        let timeout = setTimeout(function() 
        {
            jcmp.events.CallRemote('EndGame', player);
            player.Respawn();
            player.invulnerable = true;
            player.dimension = 1;
        }, 5000);
        this.timeouts.push(timeout);
        jcmp.events.CallRemote('SyncPlayersIngame', null, this.players.length);
        jcmp.events.CallRemote('PlayerDiedDeathmatch', null, player.networkId);
    }

    player_tied(player)
    {
        player.invulnerable = true;
        jcmp.events.CallRemote('ShowDeathScreen', player, 1, true);
        //delete this.players[player.networkId];
        let timeout = setTimeout(function() 
        {
            player.Respawn();
            player.dimension = 1;
        }, 5000);
        this.timeouts.push(timeout);
    }

    remove_player(player)
    {
        this.players = this.players.filter(p => p.networkId != player.networkId);
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


}