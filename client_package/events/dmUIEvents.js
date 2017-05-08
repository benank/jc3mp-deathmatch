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

jcmp.ui.AddEvent('dm/hidecountdown', () => {
    countdown.hidden = true;
})

jcmp.ui.AddEvent('dm/MainUILoaded', () => {
    jcmp.events.Call('Verify');
})

jcmp.ui.AddEvent('dm/RadarTimeoutEnd', () => {
    
    if (pois.length > 0)
    {
        pois.forEach((poi) => {
            poi.Destroy();
        })
    }
    pois = [];

})