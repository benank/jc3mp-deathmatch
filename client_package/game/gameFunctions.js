function GetNewSpectatingPlayer()
{
    let players = jcmp.players.filter(p => p.networkId != jcmp.localPlayer.networkId);
    if (players.length == 0)
    {
        return null;
    }
    index = Math.floor(Math.random() * players.length);

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

function ResetCamera()
{
    jcmp.localPlayer.camera.attachedToPlayer = false;
    jcmp.localPlayer.camera.position = camera_position;
    jcmp.localPlayer.camera.rotation = new Vector3f(Math.PI / 2, 0, 0);
    jcmp.localPlayer.controlsEnabled = true;
    jcmp.localPlayer.frozen = true;
}


function SpectateCamera(player, r)
{
    //let head_pos = player.GetBoneTransform(0xA877D9CC, r.dtf).position;
    //jcmp.localPlayer.camera.attachedToPlayer = false;
    //jcmp.localPlayer.camera.position = lerp(jcmp.localPlayer.camera.position, head_pos.add(new Vector3f(0,0.5,0), 0.8));
    //jcmp.localPlayer.camera.rotation = lerp(jcmp.localPlayer.camera.rotation, player.rotation, 0.9);

    let p_pos = player.position;
    let p_rot = player.rotation;
    let offset = new Vector3f(1,1.75,-5.5);
    to_pos = p_pos.add(vq(offset, jcmp.localPlayer.camera.rotation));
    to_rot = p_rot;
    //jcmp.localPlayer.camera.rotation = lerp(jcmp.localPlayer.camera.rotation, to_rot, 0.73);
    //jcmp.localPlayer.camera.position = lerp(jcmp.localPlayer.camera.position, to_pos, 0.73);
    jcmp.localPlayer.camera.rotation = player.rotation;
    jcmp.localPlayer.camera.position = to_pos;
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
            let type = weapon.type;
            if (weapon.health) {type = 'regen';}
            else if (weapon.radar) {type = 'radar';}
            
            if (weapon_icons[weapon.type].texture)
            {
                r.DrawTexture(weapon_icons[type].texture, w_translate, new Vector2f(size,size));
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
}

function vq(v,q)
{
    return vx(vy(v, q), q);
}

function vx(v,q)
{
    return new Vector3f(v.x,
        v.y * Math.cos(q.x) + v.z * Math.sin(q.x),
        v.y * Math.sin(q.x) - v.z * Math.cos(q.x));
}

function vy(v,q)
{
    return new Vector3f(v.x * Math.cos(q.y) + v.z * Math.sin(q.y),
        v.y,
        -v.x * Math.sin(q.y) + v.z * Math.cos(q.y));
}

function vz(v,q)
{
    return new Vector3f(v.x * Math.cos(q.z) + v.y * Math.sin(q.z), 
        v.x * Math.sin(q.z) - v.y * Math.cos(q.z), 
        v.z);
}
