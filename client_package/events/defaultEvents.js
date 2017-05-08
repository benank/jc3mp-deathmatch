jcmp.events.Add('GameTeleportInitiated', () => {
    jcmp.events.CallRemote('dm/GameTeleportInitiated');
})

jcmp.events.Add('GameTeleportCompleted', () => {
    jcmp.events.CallRemote('dm/GameTeleportCompleted');
})


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
        if (typeof localplayer == 'undefined')
        {
            localplayer = jcmp.players.find(p => p.networkId == jcmp.localPlayer.networkId);
        }
        else
        {
            jcmp.ui.CallEvent('dm/updatehealthui', (localplayer.health / localplayer.maxHealth));
        }
        
    }
    else if (spectating && typeof spectating_player != 'undefined' && spectating_player != null)
    {
        jcmp.ui.CallEvent('dm/updatehealthui', (spectating_player.health / spectating_player.maxHealth));
    }
});
