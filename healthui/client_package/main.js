const ui = new WebUIWindow("main", "package://healthui/ui/index.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
ui.autoResize = true;
ui.hidden = true;

let localplayer = jcmp.players.find(p => p.networkId == jcmp.localPlayer.networkId);

jcmp.events.Add('DeathmatchRoundBegin', () => {
    ui.hidden = false;
})

jcmp.events.Add('EndDeathmatchRound', () => {
    ui.hidden = true;
})

jcmp.events.Add('PlayerDiedDeathmatch', () => {
    ui.hidden = true;
})


jcmp.events.Add("GameUpdateRender", (renderer) => {
    if (localplayer != null)
    {
        jcmp.ui.CallEvent('healthui/updatehealth', (localplayer.health / localplayer.maxHealth));
    }
})

/*
bugs
game messes up when player dies outside of area when countdown finishes
when players die, ingame is not updated
when players die and go to home screen, countdown is not updated
weapons do not respawn from match to match


*/