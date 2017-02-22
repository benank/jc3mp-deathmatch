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

//jcmp.localPlayer.wingsuit.boostDuration = 10000000;
//jcmp.localPlayer.wingsuit.boostPower = 1000;

jcmp.ui.AddEvent('SecondTick', () => {

    if (countdownTime > 0)
    {
        if (!countdown_sound)
        {
            jcmp.ui.CallEvent('deathmatch/startcountdownsound');
            countdown_sound = true;
            jcmp.localPlayer.frozen = false;
        }
        else
        {
            countdownTime--;
        }
        jcmp.ui.CallEvent('deathmatch/updategamestartcountdown', countdownTime);
        if (countdownTime == 0)
        {
            jcmp.ui.CallEvent('deathmatch/updategamestartcountdown', "GO!");
            jcmp.events.Call('DeathmatchRoundBegin');
            jcmp.localPlayer.controlsEnabled = true;
            ingame_ui.hidden = false;
            jcmp.ui.CallEvent('deathmatch/setingametime', defaults.max_time);
            timer_ui.hidden = false;
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

        if (leaving_field && ingame)
        {
            leaving_field_time = (leaving_field_time > 0) ? leaving_field_time - 1 : 0;
            jcmp.ui.CallEvent('deathmatch/updateleavingfield', leaving_field_time);
            leavingmsg.hidden = false;
            if (leaving_field_time == 0)
            {
                jcmp.events.CallRemote('deathmatch/killfromleavingfield');
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
    }
    if (num_ingame >= 1)
    {
        jcmp.ui.CallEvent('deathmatch/decreaseingametime');
    }
    else
    {
        jcmp.ui.CallEvent('deathmatch/changebordercolor', "white");
    }
})

jcmp.events.AddRemoteCallable('EndGame', () => {
    ingame = false;
    if (!integrated_ui)
    {
        ui.hidden = false;
        ResetCamera();
    }
    ingame_ui.hidden = true;
    border.hidden = true;
    leavingmsg.hidden = true;
    countdown_sound = false;
    timer_ui.hidden = true;
    shrink_border = false;
    countdown.hidden = true;
    jcmp.ui.CallEvent('ResetCountdownCSS');
    jcmp.ui.CallEvent('deathmatch/changebordercolor', "white");
    jcmp.events.Call('EndDeathmatchRound');
    jcmp.world.weather = 0;
})

jcmp.events.AddRemoteCallable('NonIntegratedUI', () => {
    integrated_ui = false;
    ui.hidden = false;
    ResetCamera();
})

jcmp.events.AddRemoteCallable('FadeInCountdown', () => {
    countdown.hidden = false;
    countdownTime = 0;
    jcmp.localPlayer.frozen = true;
    jcmp.ui.CallEvent('deathmatch/fadeincountdown');
})

jcmp.events.AddRemoteCallable('SyncOnlinePlayers', (num) => {
    num_players = num;
    jcmp.ui.CallEvent('NumPlayers', num_players);
})

jcmp.events.AddRemoteCallable('BorderShrink', (size, time) => {
    jcmp.ui.CallEvent('deathmatch/setingametime', time);
    jcmp.ui.CallEvent('deathmatch/changebordercolor', "red");
    shrink_border = true;
    shrink_size = size;
})

jcmp.events.AddRemoteCallable('ShowDeathScreen', (num, tied) => {
    jcmp.ui.CallEvent('deathmatch/localplayerdead', num, tied);
    death_ui.hidden = false;
    jcmp.events.Call('PlayerDiedDeathmatch');
    ingame = false;
    countdown.hidden = true;
})

jcmp.events.AddRemoteCallable('CleanupIngameUI', () => {
    jcmp.ui.CallEvent('CleanupIngameUI');
    ingame = false;
    countdownTime = 0;
    countdown_sound = false;
})

jcmp.events.AddRemoteCallable('SyncPlayersIngame', (num) => {
    num_ingame = num;
    jcmp.ui.CallEvent('NumPlayersIngame', num_ingame);
    if (ingame)
    {
        jcmp.ui.CallEvent('deathmatch/cannonsound');
    }
})

jcmp.events.AddRemoteCallable('ChangeArena', (data) => {
    data = JSON.parse(data);
    camera_position = new Vector3f(data.x, data.y + 600, data.z);
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
    jcmp.localPlayer.frozen = true;
    jcmp.localPlayer.controlsEnabled = true;
}

jcmp.events.AddRemoteCallable('InitializeDefaults', (data) => {
    defaults = JSON.parse(data);
    center = new Vector3f(defaults.centerPoint.x, defaults.centerPoint.y, defaults.centerPoint.z);
    diameter = new Vector2f(defaults.diameter, defaults.diameter);
    if (weathers.indexOf(defaults.weather) > -1)
    {
        jcmp.world.weather = weathers.indexOf(defaults.weather);
    }
    m = CreateNewBorderMatrix();
    //jcmp.world.SetTime(defaults.time.hour, defaults.time.minutes);
})

jcmp.events.AddRemoteCallable('InitializeWeaponSpawns', (data) => {
    weaponSpawns = [];
    near_weapons = [];
    weaponSpawns = JSON.parse(data);
})

jcmp.events.AddRemoteCallable('WeaponTake', (index) => {
    weaponSpawns[index].disabled = true;
})

jcmp.events.AddRemoteCallable('WeaponRespawn', (index) => {
    weaponSpawns[index].disabled = false;
})

jcmp.events.AddRemoteCallable('CountDownStart', (time) => {
    countdownTime = time;
    jcmp.ui.CallEvent('deathmatch/updategamestartcountdown', countdownTime);
    jcmp.localPlayer.camera.attachedToPlayer = true;
    jcmp.localPlayer.controlsEnabled = false;
    jcmp.localPlayer.frozen = false;
    ui.hidden = true;
    ingame = true;
    death_ui.hidden = true;
})

jcmp.events.AddRemoteCallable('SyncIngameTime', (time, showdown) => {
    jcmp.ui.CallEvent('deathmatch/setingametime', time);
    if (showdown)
    {
        jcmp.ui.CallEvent('deathmatch/changebordercolor', "red");
    }
})

jcmp.events.AddRemoteCallable('SteamAvatarURLUpdate', (data) => {
    steam_urls = JSON.parse(data);
    jcmp.ui.CallEvent('deathmatch/updatesteamavatars', data);
})

jcmp.events.AddRemoteCallable('PlayerDiedDeathmatch', (id) => {
    jcmp.ui.CallEvent('deathmatch/playerdied', id);
})

jcmp.events.AddRemoteCallable('RemoveSteamAvatar', (id) => {
    steam_urls = steam_urls.filter(p => p.id != id);
    jcmp.ui.CallEvent('deathmatch/updatesteamavatars', JSON.stringify(steam_urls));
})

jcmp.ui.AddEvent('deathmatch/hidecountdown', () => {
    countdown.hidden = true;
})

jcmp.ui.AddEvent('MainUILoaded', () => {
    jcmp.events.Call('Verify');
})


let m = CreateNewBorderMatrix();

jcmp.events.Add("GameUpdateRender", (renderer) => {
    if (!ingame)
    {
        return;
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
});

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
            //head.LookAt(head.position, cam, up)
            let matrix = new Matrix().Translate(pos);
            matrix = matrix.LookAt(pos, cam_pos, up);
            r.SetTransform(matrix);
            r.DrawTexture(weapon_icons[weapon.type].texture, w_translate, new Vector2f(size,size));
            //r.DrawTexture(weapon_icon.texture, new Vector3f(0,0,0), new Vector2f(size,size));
            
            let dist = Distance(player_pos, pos);
            if (dist < pickup_dist)
            {
                let index = GetWeaponIndex(spawn);
                jcmp.events.CallRemote('PickupWeapon', index);
                jcmp.ui.CallEvent('deathmatch/pickupweaponsound');
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