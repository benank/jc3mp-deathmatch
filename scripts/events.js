
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
    player.dm = [];
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
            jcmp.events.CallRemote('SyncIngameTime', player, dm.game.current_game.current_time, dm.game.current_game.showdown_mode);
        }
        
        player.ready = true;
        player.health = 800;
        player.invulnerable = true;
        player.dimension = 1;
        player.position = new Vector3f(3891.033203125, 1557.2899169921875, 687.85791015625);
        jcmp.events.CallRemote('SyncOnlinePlayers', null, jcmp.players.length);
        if (dm.config.chat_settings.on_join_leave)
        {
            console.log(`${player.name} joined.`);
            lang.broadcast(lang.formatMessage(lang.msgs.on_s_join, {name: player.name}));
        }
        jcmp.events.CallRemote('ChangeArena', player, JSON.stringify(dm.game.current_arena.defaults.centerPoint));
        jcmp.events.CallRemote('NonIntegratedUI', player);
        gm.AddPlayerToLobby(player);
    }

    if (dm.config.testing_settings.override_utility && dm.config.testing_settings.enabled)
    {
        jcmp.events.CallRemote('OverrideUtility', player);
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
    
    gm.RemovePlayerFromLobby(player);

    if (dm.game.current_game != null)
    {
        dm.game.current_game.remove_player(player);
        if (!dm.config.testing_settings.enabled)
        {
            gm.CheckIfGameShouldEnd();
        }
        dm.game.current_game.check_for_nulls();
        dm.game.current_game.spectators = dm.game.current_game.spectators.filter(p => p.networkId != player.networkId);
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

jcmp.events.AddRemoteCallable('GameTeleportInitiated', (player) => {
    player.dm.teleporting = true;
})

jcmp.events.AddRemoteCallable('GameTeleportCompleted', (player) => {
    player.dm.teleporting = false;
})

jcmp.events.AddRemoteCallable('BeginSpectate', (player) => {
    if (dm.game.current_game == null || !dm.game.current_game.active)
    {
        console.log("PLAYER SPECTATE FAILED");
        lang.send(player, lang.formatMessage(lang.msgs.on_spectate_fail, {}));
        return;
    }
    console.log("BEGIN PLAYER SPECTATE");

    jcmp.events.CallRemote('BeginSpectate', player, JSON.stringify(dm.game.current_game.defaults), JSON.stringify(dm.game.current_game.weaponSpawnPoints));
    dm.game.current_game.spectators.push(player);
    let data = dm.game.current_game.defaults.centerPoint;
    player.position = new Vector3f(data.x, data.y, data.z);
    
    player.dms = [];
    player.dms.position = player.position;
    player.dms.dimension = player.dimension;
    player.dimension = (dm.config.integrated_mode) ? dm.config.integrated_settings.dimension : 0;
    jcmp.events.CallRemote('SteamAvatarURLUpdate', player, JSON.stringify(dm.avatars));
    jcmp.events.CallRemote('SpectatingAvatarsUpdate', player, JSON.stringify(dm.game.current_game.dead));
})

jcmp.events.AddRemoteCallable('EndSpectate', (player) => {
    console.log("END SPECTATE");
    player.position = player.dms.position;
    player.dimension = player.dms.dimension;
})