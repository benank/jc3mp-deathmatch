const ui = new WebUIWindow("maintitle", "package://deathmatch/ui/index.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
ui.autoResize = true;
ui.hidden = true;

const leavingmsg = new WebUIWindow("leavingmsg", "package://deathmatch/ui/leavingfield.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
leavingmsg.autoResize = true;
leavingmsg.captureMouseInput = false;
leavingmsg.hidden = true;

const timer_ui = new WebUIWindow("timer_ui", "package://deathmatch/ui/timer.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
timer_ui.autoResize = true;
timer_ui.captureMouseInput = false;
timer_ui.hidden = true;

const countdown = new WebUIWindow("countdown", "package://deathmatch/ui/countdown.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
countdown.autoResize = true;
countdown.captureMouseInput = false;
countdown.hidden = true;

const ingame_ui = new WebUIWindow("ingame_ui", "package://deathmatch/ui/ingameplayers.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
ingame_ui.autoResize = true;
ingame_ui.captureMouseInput = false;
ingame_ui.hidden = true;

const death_ui = new WebUIWindow("death_ui", "package://deathmatch/ui/death.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
death_ui.autoResize = true;
death_ui.captureMouseInput = false;
death_ui.hidden = true;

const border = new WebUIWindow("border", "package://deathmatch/ui/border.html", new Vector2(1000, 1000));
border.autoRenderTexture = false;
border.autoResize = false;
border.captureMouseInput = false;
border.hidden = true;

const health_ui = new WebUIWindow("health_ui", "package://deathmatch/ui/health.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
health_ui.autoResize = true;
health_ui.captureMouseInput = false;
health_ui.hidden = true;

const spectate_ui = new WebUIWindow("spectate_ui", "package://deathmatch/ui/spectate.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
spectate_ui.autoResize = true;
spectate_ui.captureMouseInput = false;
spectate_ui.hidden = true;

const weapon_icons = [];
weapon_icons.pistol = new WebUIWindow("weapon_icon1", "package://deathmatch/ui/weapons/pistol.html", new Vector2(500, 500));
weapon_icons.submachine = new WebUIWindow("weapon_icon2", "package://deathmatch/ui/weapons/submachine.html", new Vector2(500, 500));
weapon_icons.rocket = new WebUIWindow("weapon_icon3", "package://deathmatch/ui/weapons/rocket.html", new Vector2(500, 500));
weapon_icons.shotgun = new WebUIWindow("weapon_icon4", "package://deathmatch/ui/weapons/shotgun.html", new Vector2(500, 500));
weapon_icons.assault = new WebUIWindow("weapon_icon5", "package://deathmatch/ui/weapons/assault.html", new Vector2(500, 500));
weapon_icons.sniper = new WebUIWindow("weapon_icon6", "package://deathmatch/ui/weapons/sniper.html", new Vector2(500, 500));

let integrated_ui = true;
let num_players = 0;
let num_ingame = 0;
let defaults;
let countdownTime = 0;
let center = new Vector3f(0,0,0);
let diameter = new Vector2f(0,0);
let delta = 0;
const leaving_field_default_time = 15;
let leaving_field_time = leaving_field_default_time;
let leaving_field = false;
let countdown_sound = false;
let weaponSpawns;
let near_weapons = [];
const pickup_dist = 1.25;
const detect_dist = 150;
let shrink_border = false;
let shrink_size = 0;
let steam_urls = [];
let camera_position = new Vector3f(0,0,0);
let localplayer = jcmp.players.find(p => p.networkId == jcmp.localPlayer.networkId);
let override_utility = false;
let spectating = false;
let spectating_player = null;

const weathers = 
[
    'base',
    'rain',
    'overcast',
    'thunderstorm',
    'fog',
    'snow'
];


let ingame = false;

jcmp.ui.AddEvent('dm/SecondTick', () => {

    if (countdownTime > 0)
    {
        if (!countdown_sound)
        {
            jcmp.ui.CallEvent('dm/startcountdownsound');
            countdown_sound = true;
        }
        else
        {
            countdownTime--;
        }
        jcmp.ui.CallEvent('dm/updategamestartcountdown', countdownTime);
        if (countdownTime == 0)
        {
            jcmp.localPlayer.controlsEnabled = true;
            jcmp.ui.CallEvent('dm/updategamestartcountdown', "GO!");
            ingame_ui.hidden = false;
            jcmp.ui.CallEvent('dm/setingametime', defaults.max_time);
            timer_ui.hidden = false;
            health_ui.hidden = false;
        }
    }
    if (ingame)
    {
        // * 0.95 because 950px/1000 for the ui to fit on the page
        let dist = Distancev2(jcmp.localPlayer.position, center);
        if (dist > diameter.x * 0.95 / 2 || jcmp.localPlayer.position.y > center.y + defaults.max_y)
        {
            leaving_field = true;
        }
        else
        {
            leaving_field = false;
        }

        if (leaving_field && ingame && countdownTime == 0)
        {
            leaving_field_time = (leaving_field_time > 0) ? leaving_field_time - 1 : 0;
            jcmp.ui.CallEvent('dm/updateleavingfield', leaving_field_time);
            leavingmsg.hidden = false;
            if (leaving_field_time == 0)
            {
                jcmp.events.CallRemote('dm/killfromleavingfield');
            }
        }
        else
        {
            leaving_field_time = leaving_field_default_time;
            leavingmsg.hidden = true;
        }

        let player_pos = jcmp.localPlayer.position;
        near_weapons = [];
        weaponSpawns.forEach(function(spawn) 
        {
            let weapon_pos = new Vector3f(spawn.x, spawn.y, spawn.z);
            let dist = Distance(player_pos, weapon_pos);
            if (dist < detect_dist)
            {
                near_weapons.push(spawn);
            }
        });
        jcmp.ui.CallEvent('dm/decreaseingametime'); // Decrease time for those ingame
    }
    if (num_ingame >= 1 && !ingame)
    {
        jcmp.ui.CallEvent('dm/decreaseingametime'); // Decrease time for those out of game in non-integrated mode
    }
    if (spectating && (spectating_player == null || typeof spectating_player == 'undefined'))
    {
        spectating_player = GetNewSpectatingPlayer();
    }
})


let can_spec = true;

jcmp.ui.AddEvent('chat_input_state', s => {
  can_spec = !s;
});

jcmp.ui.AddEvent('dm/KeyPress', (key) => {
    if (key == "x".charCodeAt(0) && !ingame && !integrated_ui && can_spec) // No spectating for integrated yet
    {
        if (spectating)
        {
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
            jcmp.events.CallRemote('dm/EndSpectate');
        }
        else
        {
            jcmp.events.CallRemote('dm/BeginSpectate');
        }
    }
    else if (key == 32 && spectating && can_spec) // key 32 is space
    {
        spectating_player = GetNextSpectatingPlayer();
    }
})

function GetNewSpectatingPlayer()
{
    let players = jcmp.players.filter(p => p.networkId != jcmp.localPlayer.networkId);
    if (players.length == 0)
    {
        return null;
    }
    index = Math.floor(Math.random() * players.length);
    //jcmp.print(`got new spectating index ${spectating_index} with length ${players.length}`);
    jcmp.ui.CallEvent('dm/changehealthspectateavatar', steam_urls, players[index].networkId);
    jcmp.ui.CallEvent('dm/updatespectatingname', players[index].name);
    for (let i = 0; i < jcmp.players.length; i++)
    {
        if (players[index].networkId == jcmp.players[i].networkId)
        {
            spectating_index = i;
        }
    }
    return players[index];
}

function GetNextSpectatingPlayer()
{
    /*spectating_index = (spectating_index + 1 > jcmp.players.length - 1) ? 0 : spectating_index + 1;

    if (typeof jcmp.players[spectating_index] == 'undefined')
    {
        //return GetNextSpectatingPlayer();
        return null; // Not going full out on the recursion just yet
        // Returning null is safe because the secondtick gets a new one anyway
    }
    else if (jcmp.players[index].networkId == jcmp.localPlayer.networkId)
    {
        return GetNextSpectatingPlayer(); // This should only recurse once ... if it does more than that, it's gon b bad
    }

    jcmp.ui.CallEvent('deathmatch/changehealthspectateavatar', steam_urls, jcmp.players[spectating_index].networkId);
    jcmp.ui.CallEvent('deathmatch/updatespectatingname', jcmp.players[spectating_index].name);
    return jcmp.players[spectating_index];*/
    return GetNewSpectatingPlayer();
}

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

function ResetCamera()
{
    jcmp.localPlayer.camera.attachedToPlayer = false;
    jcmp.localPlayer.camera.position = camera_position;
    jcmp.localPlayer.camera.rotation = new Vector3f(Math.PI / 2, 0, 0);
    jcmp.localPlayer.controlsEnabled = true;
    jcmp.localPlayer.frozen = true;
}



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
    jcmp.world.SetTime(defaults.time.hour, defaults.time.minute);
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
})

jcmp.events.AddRemoteCallable('dm/WeaponRespawn', (index) => {
    weaponSpawns[index].disabled = false;
})

jcmp.events.AddRemoteCallable('dm/CountDownStart', (time) => {
    countdownTime = time;
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

jcmp.ui.AddEvent('dm/hidecountdown', () => {
    countdown.hidden = true;
})

jcmp.ui.AddEvent('dm/MainUILoaded', () => {
    jcmp.events.Call('Verify');
})

jcmp.events.Add('GameTeleportInitiated', () => {
    jcmp.events.CallRemote('dm/GameTeleportInitiated');
})

jcmp.events.Add('GameTeleportCompleted', () => {
    jcmp.events.CallRemote('dm/GameTeleportCompleted');
})


let m = CreateNewBorderMatrix();

jcmp.events.Add("GameUpdateRender", (renderer) => {
    if (!ingame && !spectating)
    {
        return;
    }
    if (spectating && spectating_player != null && typeof spectating_player != 'undefined')
    {
        SpectateCamera(spectating_player, renderer);
    }
    RenderWeapons(renderer);
    renderer.SetTransform(m);
    const max_circles = 10;
    const max_delta = defaults.max_y;
    for (let i = 1; i <= max_circles; i++)
    {
        let d = delta + (max_delta / max_circles) * i;
        if (d > max_delta)
        {
            d -= max_delta;
        }
        RenderCircle(renderer, border.texture, new Vector3f(-diameter.x / 2, -diameter.x / 2, d), diameter);
    }
    delta += 1 / 2;
    if (delta > max_delta)
    {
        delta = 0;
    }
    if (shrink_border)
    {
        let new_size = (diameter.x > shrink_size) ? diameter.x - 0.75 : shrink_size;
        diameter = new Vector2f(new_size, new_size);
    }
    if (typeof localplayer != undefined && !spectating)
    {
        jcmp.ui.CallEvent('dm/updatehealthui', (localplayer.health / localplayer.maxHealth));
    }
    else if (spectating && typeof spectating_player != 'undefined' && spectating_player != null)
    {
        jcmp.ui.CallEvent('dm/updatehealthui', (spectating_player.health / spectating_player.maxHealth));
    }
});

function SpectateCamera(player, r)
{
    let head_pos = player.GetBoneTransform(0xA877D9CC, r.dtf).position;
    jcmp.localPlayer.camera.attachedToPlayer = false;
    jcmp.localPlayer.camera.position = lerp(jcmp.localPlayer.camera.position, head_pos.add(new Vector3f(0,0.5,0), 0.8));
    jcmp.localPlayer.camera.rotation = lerp(jcmp.localPlayer.camera.rotation, player.rotation, 0.9);
}

function RenderWeapons(r)
{
    let size = 1;
    let w_translate = new Vector3f(-size/2,-1.5,-size/2);
    let up = new Vector3f(0, 1, 0);
    let cam_pos = jcmp.localPlayer.camera.position;
    let player_pos = jcmp.localPlayer.position;

    for (let i = 0; i < near_weapons.length; i++)
    {
        let spawn = near_weapons[i];
        let weapon = weaponSpawns[GetWeaponIndex(spawn)];
        if (weapon.disabled != true)
        {
            let pos = new Vector3f(spawn.x, spawn.y, spawn.z);
            let matrix = new Matrix().Translate(pos);
            matrix = matrix.LookAt(pos, cam_pos, up);
            r.SetTransform(matrix);
            if (weapon_icons[weapon.type].texture)
            {
                r.DrawTexture(weapon_icons[weapon.type].texture, w_translate, new Vector2f(size,size));
            }
            
            let dist = Distance(player_pos, pos);
            if (dist < pickup_dist && !spectating)
            {
                let index = GetWeaponIndex(spawn);
                jcmp.events.CallRemote('dm/PickupWeapon', index);
                jcmp.ui.CallEvent('dm/pickupweaponsound');
                weaponSpawns[index].disabled = true;
            }
        }
    };
}

function RenderCircle(renderer, texture, translation, size)
{
    renderer.DrawTexture(texture, translation, size);
}

function CreateNewBorderMatrix()
{
    let m2 = new Matrix().Translate(center);
    m2 = m2.Rotate(Math.PI / 2, new Vector3f(1, 0, 0));
    return m2;
}


function Distancev2(a, b)
{
    let vector = new Vector3f(a.x - b.x, 0, a.z - b.z);
    return Math.sqrt(vector.x * vector.x + vector.z * vector.z);
}

function Distance(a, b)
{
    let vector = new Vector3f(a.x - b.x, a.y - b.y, a.z - b.z);
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

function GetWeaponIndex(spawn)
{
    for (let i = 0; i < weaponSpawns.length; i++)
    {
        let weap = weaponSpawns[i];
        if (spawn.type == weap.type && spawn.x == weap.x && spawn.y == weap.y && spawn.z == weap.z)
        {
            return i;
        }
    };
    return null;
}

function lerp(a,b,t)
{
    return (a.add( ( b.sub(a) ).mul(new Vector3f(t,t,t)) ));
    //return a.add(b.sub(a).mul(t));
    //return b;
}


// For some reason it didn't want to do this through a foreach
weapon_icons.pistol.autoResize = false;
weapon_icons.pistol.texture.size = new Vector2f(500, 500);
weapon_icons.pistol.captureMouseInput = false;
weapon_icons.pistol.hidden = true;
weapon_icons.pistol.autoRenderTexture = false;
weapon_icons.shotgun.autoResize = false;
weapon_icons.shotgun.texture.size = new Vector2f(500, 500);
weapon_icons.shotgun.captureMouseInput = false;
weapon_icons.shotgun.hidden = true;
weapon_icons.shotgun.autoRenderTexture = false;
weapon_icons.sniper.autoResize = false;
weapon_icons.sniper.texture.size = new Vector2f(500, 500);
weapon_icons.sniper.captureMouseInput = false;
weapon_icons.sniper.hidden = true;
weapon_icons.sniper.autoRenderTexture = false;
weapon_icons.assault.autoResize = false;
weapon_icons.assault.texture.size = new Vector2f(500, 500);
weapon_icons.assault.captureMouseInput = false;
weapon_icons.assault.hidden = true;
weapon_icons.assault.autoRenderTexture = false;
weapon_icons.rocket.autoResize = false;
weapon_icons.rocket.texture.size = new Vector2f(500, 500);
weapon_icons.rocket.captureMouseInput = false;
weapon_icons.rocket.hidden = true;
weapon_icons.rocket.autoRenderTexture = false;
weapon_icons.submachine.autoResize = false;
weapon_icons.submachine.texture.size = new Vector2f(500, 500);
weapon_icons.submachine.captureMouseInput = false;
weapon_icons.submachine.hidden = true;
weapon_icons.submachine.autoRenderTexture = false;