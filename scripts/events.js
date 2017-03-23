
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
            jcmp.events.CallRemote('dm/SyncPlayersIngame', player, dm.game.current_game.players.length);
            jcmp.events.CallRemote('dm/SyncIngameTime', player, dm.game.current_game.current_time, dm.game.current_game.showdown_mode);
        }
        
        player.ready = true;
        player.health = 800;
        player.invulnerable = true;
        player.dimension = 1;
        player.position = new Vector3f(3891.033203125, 1557.2899169921875, 687.85791015625);
        jcmp.events.CallRemote('dm/SyncOnlinePlayers', null, jcmp.players.length, dm.config.game_settings.min_players);
        if (dm.config.chat_settings.on_join_leave)
        {
            console.log(`${player.name} joined.`);
            lang.broadcast(lang.formatMessage(lang.msgs.on_s_join, {name: player.name}));
        }
        jcmp.events.CallRemote('dm/ChangeArena', player, JSON.stringify(dm.game.current_arena.defaults.centerPoint));
        jcmp.events.CallRemote('dm/NonIntegratedUI', player);
        gm.AddPlayerToLobby(player);
    }

    if (dm.config.testing_settings.override_utility && dm.config.testing_settings.enabled)
    {
        jcmp.events.CallRemote('dm/OverrideUtility', player);
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
            jcmp.events.CallRemote('dm/SyncOnlinePlayers', null, jcmp.players.length, dm.config.game_settings.min_players);
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
    jcmp.events.CallRemote('dm/RemoveSteamAvatar', null, player.networkId);

    if (dm.game.current_game != null)
    {
        dm.game.current_game.spectators = dm.game.current_game.spectators.filter(id => id != player.networkId);
    }
    
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

jcmp.events.Add('dm/WeaponTimeoutRespawn', (index, respawn_time) => 
{
    dm.game.current_game.timeouts.push(setTimeout(function() 
    {
        if (dm.game.current_game != null)
        {
            dm.game.current_game.broadcast_weap_respawn(index);
        }
    }, respawn_time));
})

jcmp.events.AddRemoteCallable('dm/killfromleavingfield', (player) => 
{
    if (dm.game.current_game != null)
    {
        player.health = 0;
    }
})

jcmp.events.AddRemoteCallable('dm/PickupWeapon', (player, index) => {
    if (dm.game.current_game != null)
    {
        dm.game.current_game.pickup_weapon(player, index);
    }
})

jcmp.events.AddRemoteCallable('dm/GameTeleportInitiated', (player) => {
    player.dm.teleporting = true;
})

jcmp.events.AddRemoteCallable('dm/GameTeleportCompleted', (player) => {
    player.dm.teleporting = false;
})

jcmp.events.AddRemoteCallable('dm/BeginSpectate', (player) => {
    if (dm.game.current_game == null || !dm.game.current_game.active)
    {
        console.log("PLAYER SPECTATE FAILED");
        lang.send(player, lang.formatMessage(lang.msgs.on_spectate_fail, {}));
        return;
    }
    console.log("BEGIN PLAYER SPECTATE");

    jcmp.events.CallRemote('dm/BeginSpectate', player, JSON.stringify(dm.game.current_game.defaults), JSON.stringify(dm.game.current_game.weaponSpawnPoints));
    dm.game.current_game.spectators.push(player);
    let data = dm.game.current_game.defaults.centerPoint;
    player.position = new Vector3f(data.x, data.y, data.z);
    
    player.dms = [];
    player.dms.position = player.position;
    player.dms.dimension = player.dimension;
    player.dimension = (dm.config.integrated_mode) ? dm.config.integrated_settings.dimension : 0;
    jcmp.events.CallRemote('dm/SteamAvatarURLUpdate', player, JSON.stringify(dm.avatars));
    jcmp.events.CallRemote('dm/SpectatingAvatarsUpdate', player, JSON.stringify(dm.game.current_game.dead));
})

jcmp.events.AddRemoteCallable('dm/EndSpectate', (player) => {
    console.log("END SPECTATE");
    player.position = player.dms.position;
    player.dimension = player.dms.dimension;
    if (dm.game.current_game != null)
    {
        dm.game.current_game.spectators = dm.game.current_game.spectators.filter(id => id != player.networkId);
    }
})