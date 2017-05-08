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
weapon_icons.regen = new WebUIWindow("weapon_icon7", "package://deathmatch/ui/weapons/regen.html", new Vector2(500, 500));
weapon_icons.radar = new WebUIWindow("weapon_icon8", "package://deathmatch/ui/weapons/radar.html", new Vector2(500, 500));


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
weapon_icons.regen.autoResize = false;
weapon_icons.regen.texture.size = new Vector2f(500, 500);
weapon_icons.regen.captureMouseInput = false;
weapon_icons.regen.hidden = true;
weapon_icons.regen.autoRenderTexture = false;
weapon_icons.radar.autoResize = false;
weapon_icons.radar.texture.size = new Vector2f(500, 500);
weapon_icons.radar.captureMouseInput = false;
weapon_icons.radar.hidden = true;
weapon_icons.radar.autoRenderTexture = false;