
const gm = require('./gameManager');
const steam = require('./steam');
const lang = require('./lang');


// Default JC3MP Events -----

jcmp.events.Add('PlayerCreated', (player) => 
{
    // Handle player spawning if standalone
    if (!dm.config.integrated_mode)
    {
        player.position = new Vector3f(3891.033203125, 1557.2899169921875, 687.85791015625);
        player.invulnerable = true;
        player.dimension = 1;
    }
})

jcmp.events.Add('PlayerReady', (player) => 
{
    if (!dm.config.integrated_mode)
    {
        if (dm.config.chat_settings.welcome)
        {
            lang.send(player, lang.formatMessage(lang.msgs.on_welcome, {name: player.name}));
        }
        
        if (dm.game.current_game != null)
        {
            jcmp.events.CallRemote('SyncPlayersIngame', player, dm.game.current_game.players.length);
            jcmp.events.CallRemote('SyncIngameTime', player, (dm.game.current_game.current_time, dm.game.current_game.showdown_mode));
        }
        
        player.ready = true;
        player.health = 800;
        player.invulnerable = true;
        player.dimension = 1;
        player.position = new Vector3f(3891.033203125, 1557.2899169921875, 687.85791015625);
        setTimeout(function() 
        {
            jcmp.events.CallRemote('SyncOnlinePlayers', null, jcmp.players.length);
        }, 1000);
        if (dm.config.chat_settings.on_join_leave)
        {
            lang.broadcast(lang.formatMessage(lang.msgs.on_s_join, {name: player.name}));
            console.log(`${player.name} joined.`);
        }
        jcmp.events.CallRemote('ChangeArena', player, JSON.stringify(dm.game.current_arena.defaults.centerPoint));
        jcmp.events.CallRemote('NonIntegratedUI');
        gm.AddPlayerToLobby(player);
    }

    steam.UpdateSteamImages(player);

})

jcmp.events.Add('PlayerDeath', (player, killer, reason) => 
{
    if (dm.game.current_game != null)
    {
        dm.game.current_game.player_died(player);
        gm.CheckIfGameShouldEnd();
    }
})

jcmp.events.Add('PlayerDestroyed', (player) => 
{
    if (!dm.config.integrated_mode)
    {
        if (dm.config.chat_settings.on_join_leave)
        {
            console.log(`${player.name} left.`);
            lang.broadcast(lang.formatMessage(lang.msgs.on_s_leave, {name: player.name}));
        }
        setTimeout(function() 
        {
            jcmp.events.CallRemote('SyncOnlinePlayers', null, jcmp.players.length);
        }, 1000);
    }
    else
    {
        gm.RemovePlayerFromLobby(player);
    }

    if (dm.game.current_game != null)
    {
        dm.game.current_game.remove_player(player);
        gm.CheckIfGameShouldEnd();
    }

    dm.avatars = dm.avatars.filter(data => data.id != player.networkId);
    jcmp.events.CallRemote('RemoveSteamAvatar', null, player.networkId);
})

// Chat event

jcmp.events.Add('chat_command', (player, message) => 
{
    if (!dm.config.integrated_mode) {return;}

    if (message == dm.config.integrated_settings.command)
    {
        if (dm.lobby.find(p => p.networkId == player.networkId))
        {
            gm.RemovePlayerFromLobby(player);
            lang.send(player, lang.formatMessage(lang.msgs.on_leave, {}));
        }
        else
        {
            gm.AddPlayerToLobby(player);
            lang.send(player, lang.formatMessage(lang.msgs.on_join, {}));
        }
    }
})

// Deathmatch Events -----

jcmp.events.Add('WeaponTimeoutRespawn', (index, respawn_time) => 
{
    dm.game.current_game.timeouts.push(setTimeout(function() 
    {
        if (dm.game.current_game != null)
        {
            dm.game.current_game.broadcast_weap_respawn(index);
        }
    }, respawn_time));
})

jcmp.events.AddRemoteCallable('deathmatch/killfromleavingfield', (player) => 
{
    if (dm.game.current_game != null)
    {
        player.health = 0;
    }
})

jcmp.events.AddRemoteCallable('PickupWeapon', (player, index) => {
    if (dm.game.current_game != null)
    {
        dm.game.current_game.pickup_weapon(player, index);
    }
})
