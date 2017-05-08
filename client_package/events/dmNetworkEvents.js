jcmp.events.AddRemoteCallable('dm/EndGame', () => {
    ingame = false;
    if (!integrated_ui)
    {
        ui.hidden = false;
        ResetCamera();
    }
    ingame_ui.hidden = true;
    leavingmsg.hidden = true;
    countdown_sound = false;
    timer_ui.hidden = true;
    shrink_border = false;
    countdown.hidden = true;
    health_ui.hidden = true;
    leaving_field_time = leaving_field_default_time;
    jcmp.ui.CallEvent('dm/ResetCountdownCSS');
    jcmp.ui.CallEvent('dm/changebordercolor', "white");
    jcmp.events.Call('dm/EndDeathmatchRound');
    jcmp.world.weather = 0;

    // Reset grapple, para, and wings abilities in case of freeroam
    jcmp.localPlayer.SetAbilityEnabled(0xCB836D80, true);
    jcmp.localPlayer.SetAbilityEnabled(0xCEEFA27A, true);
    jcmp.localPlayer.SetAbilityEnabled(0xE060F641, true);
})

jcmp.events.AddRemoteCallable('dm/OverrideUtility', () => {
    override_utility = true;
})

jcmp.events.AddRemoteCallable('dm/NonIntegratedUI', () => {
    integrated_ui = false;
    ui.hidden = false;
    ResetCamera();
})

jcmp.events.AddRemoteCallable('dm/EndSpectate', () => {
    spectating = false;
    spectating_player = null;
    jcmp.localPlayer.frozen = false;
    if (!integrated_ui)
    {
        ui.hidden = false;
        ResetCamera();
    }
    else
    {
        jcmp.localPlayer.camera.attachedToPlayer = true;
    }
    ingame_ui.hidden = true;
    leavingmsg.hidden = true;
    countdown_sound = false;
    timer_ui.hidden = true;
    shrink_border = false;
    countdown.hidden = true;
    health_ui.hidden = true;
    spectate_ui.hidden = true;
    //leaving_field_time = leaving_field_default_time; // Eventually calculate if spectated player is out of bounds
    jcmp.ui.CallEvent('dm/changebordercolor', "white");
    jcmp.ui.CallEvent('dm/updatehealthspectating', false);
    jcmp.world.weather = 0;
})

jcmp.events.AddRemoteCallable('dm/FadeInCountdown', () => {
    countdown.hidden = false;
    countdownTime = 0;
    jcmp.ui.CallEvent('dm/fadeincountdown');
})

jcmp.events.AddRemoteCallable('dm/SyncOnlinePlayers', (num, needed) => {
    num_players = num;
    jcmp.ui.CallEvent('dm/NumPlayers', num_players, needed);
})

jcmp.events.AddRemoteCallable('dm/BorderShrinkSpectator', (time) => {
    jcmp.ui.CallEvent('dm/setingametime', time);
    jcmp.ui.CallEvent('dm/changebordercolor', "red");
})

jcmp.events.AddRemoteCallable('dm/BorderShrink', (size, time) => {
    jcmp.ui.CallEvent('dm/setingametime', time);
    jcmp.ui.CallEvent('dm/changebordercolor', "red");
    shrink_border = true;
    shrink_size = size;
})

jcmp.events.AddRemoteCallable('dm/ShowDeathScreen', (num, tied) => {
    jcmp.ui.CallEvent('dm/localplayerdead', num, tied);
    death_ui.hidden = false;
    jcmp.events.Call('dm/PlayerDiedDeathmatch');
    ingame = false;
    countdown.hidden = true;
    health_ui.hidden = true;
    countdownTime = 0;
    countdown_sound = false;
    jcmp.ui.CallEvent('dm/CleanupIngameUI');
    jcmp.localPlayer.healthEffects.regenRate = 120;
    jcmp.localPlayer.healthEffects.regenCooldown = 5;
})

jcmp.events.AddRemoteCallable('dm/CleanupIngameUI', () => {
    jcmp.ui.CallEvent('dm/CleanupIngameUI');
    ingame = false;
    countdownTime = 0;
    countdown_sound = false;
})

jcmp.events.AddRemoteCallable('dm/SyncPlayersIngame', (num) => {
    num_ingame = num;
    jcmp.ui.CallEvent('dm/NumPlayersIngame', num_ingame);
})

jcmp.events.AddRemoteCallable('dm/ChangeArena', (data) => {
    data = JSON.parse(data);
    camera_position = new Vector3f(data.x, data.y + 650, data.z);
    if (!integrated_ui)
    {
        ResetCamera();
    }
})

jcmp.events.AddRemoteCallable('dm/BeginSpectate', (d, w) => {
    defaults = JSON.parse(d);
    center = new Vector3f(defaults.centerPoint.x, defaults.centerPoint.y, defaults.centerPoint.z);
    diameter = new Vector2f(defaults.diameter, defaults.diameter);
    if (weathers.indexOf(defaults.weather) > -1)
    {
        jcmp.world.weather = weathers.indexOf(defaults.weather);
    }
    m = CreateNewBorderMatrix();
    jcmp.ui.CallEvent('dm/updatehealthspectating', true);
    jcmp.localPlayer.frozen = true;
    weaponSpawns = [];
    near_weapons = [];
    weaponSpawns = JSON.parse(w);
    spectating_player = GetNewSpectatingPlayer();
    spectating = true;
    spectate_ui.hidden = false;
    ingame_ui.hidden = false;
    timer_ui.hidden = false;
    health_ui.hidden = false;
    ui.hidden = true;
})

jcmp.events.AddRemoteCallable('dm/InitializeDefaults', (data) => {
    defaults = JSON.parse(data);
    center = new Vector3f(defaults.centerPoint.x, defaults.centerPoint.y, defaults.centerPoint.z);
    diameter = new Vector2f(defaults.diameter, defaults.diameter);
    jcmp.localPlayer.healthEffects.regenRate = 0;
    jcmp.world.SetTime(defaults.time.hour, defaults.time.minute, 0);
    if (weathers.indexOf(defaults.weather) > -1)
    {
        jcmp.world.weather = weathers.indexOf(defaults.weather);
    }
    m = CreateNewBorderMatrix();
    jcmp.ui.CallEvent('dm/updatehealthspectating', false);

    if (override_utility)
    {
        jcmp.localPlayer.wingsuit.boostDuration = 10000000;
        jcmp.localPlayer.wingsuit.boostPower = 1000;
        jcmp.localPlayer.SetAbilityEnabled(0xCB836D80, true);
        jcmp.localPlayer.SetAbilityEnabled(0xCEEFA27A, true);
        jcmp.localPlayer.SetAbilityEnabled(0xE060F641, true);
    }
    else
    {
        jcmp.localPlayer.wingsuit.boostEnabled = false; // No boost on ALL maps
        jcmp.localPlayer.SetAbilityEnabled(0xCB836D80, defaults.grapple_enabled);
        jcmp.localPlayer.SetAbilityEnabled(0xCEEFA27A, defaults.para_enabled);
        jcmp.localPlayer.SetAbilityEnabled(0xE060F641, defaults.wings_enabled);
    }
    jcmp.ui.CallEvent('dm/changebordercolor', "white");

    if (spectating)
    {
        spectating = false;
        spectating_player = null;
        jcmp.localPlayer.camera.attachedToPlayer = true;
        ingame_ui.hidden = true;
        leavingmsg.hidden = true;
        countdown_sound = false;
        timer_ui.hidden = true;
        shrink_border = false;
        countdown.hidden = false;
        countdownTime = 0;
        jcmp.ui.CallEvent('dm/fadeincountdown');
        health_ui.hidden = true;
        spectate_ui.hidden = true;
        jcmp.ui.CallEvent('dm/changebordercolor', "white");
        jcmp.ui.CallEvent('dm/updatehealthspectating', false);
    }

})

jcmp.events.AddRemoteCallable('dm/InitializeWeaponSpawns', (data) => {
    weaponSpawns = [];
    near_weapons = [];
    weaponSpawns = JSON.parse(data);
})

jcmp.events.AddRemoteCallable('dm/WeaponTake', (index) => {
    weaponSpawns[index].disabled = true;
    weaponSpawns[index].health = false;
})

jcmp.events.AddRemoteCallable('dm/WeaponRespawn', (index) => {
    weaponSpawns[index].disabled = false;
})

jcmp.events.AddRemoteCallable('dm/CountDownStart', (time) => {
    countdownTime = time;
    let localplayer = jcmp.players.find(p => p.networkId == jcmp.localPlayer.networkId);
    jcmp.ui.CallEvent('dm/updategamestartcountdown', countdownTime);
    jcmp.localPlayer.camera.attachedToPlayer = true;
    jcmp.localPlayer.frozen = false;
    jcmp.localPlayer.controlsEnabled = false;
    ui.hidden = true;
    ingame = true;
    death_ui.hidden = true;
})

jcmp.events.AddRemoteCallable('dm/SyncIngameTime', (time, showdown) => {
    jcmp.ui.CallEvent('dm/setingametime', time);
    if (showdown)
    {
        jcmp.ui.CallEvent('dm/changebordercolor', "red");
    }
})

jcmp.events.AddRemoteCallable('dm/SteamAvatarURLUpdate', (data) => {
    steam_urls = JSON.parse(data);
    steam_urls.forEach(function(profile) {
        if ((profile.id == jcmp.localPlayer.networkId && !spectating) || 
        (spectating && typeof spectating_player != 'undefined' && spectating_player != null && spectating_player.networkId == profile.id))
        {
            profile.localplayer = true;
        }
    });
    jcmp.ui.CallEvent('dm/updatesteamavatars', JSON.stringify(steam_urls));
})

jcmp.events.AddRemoteCallable('dm/SpectatingAvatarsUpdate', (avatars) => {
    let data = JSON.parse(avatars);
    data.forEach(function(id) {
        jcmp.ui.CallEvent('dm/playerdied', id); // Update dead avatars for spectators
    });
})

jcmp.events.AddRemoteCallable('dm/PlayerDiedDeathmatch', (id) => {
    jcmp.ui.CallEvent('dm/playerdied', id);
    jcmp.ui.CallEvent('dm/cannonsound');
    if (spectating && spectating_player.networkId == id)
    {
        spectating_player = GetNewSpectatingPlayer();
    }
})

jcmp.events.AddRemoteCallable('dm/RemoveSteamAvatar', (id) => {
    steam_urls = steam_urls.filter(p => p.id != id);
    jcmp.ui.CallEvent('dm/updatesteamavatars', JSON.stringify(steam_urls));
})

jcmp.events.AddRemoteCallable('dm/RadarPositions', (data) => {
    data = JSON.parse(data);

    if (pois.length > 0)
    {
        pois.forEach((poi) => {
            poi.Destroy();
        })
    }
    pois = [];

    data.forEach((entry) => {
        const pos = new Vector3f(entry.x, entry.y, entry.z);
        const poi = new POI(15, pos, ' ');
        poi.clampedToScreen = true;
        pois.push(poi);
    })

    jcmp.ui.CallEvent('dm/RadarTimeoutStart');

})