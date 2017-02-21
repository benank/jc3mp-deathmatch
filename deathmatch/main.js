
global.dm = 
{
    deathmatch: require('./dm/deathmatch')


}

// people crash right when GAME START and then the other players who are loaded get infinite black screen

const chat = jcmp.events.Call('get_chat')[0];

let wait_time = 15; // Time before a match starts in seconds
let min_players = 2;
let current_arena;
let arenas = [];
const testing_mode_on = false; // Turn this on if you want to test by yourself

let current_game;
let timer;

const fs = require('fs');

// fades to black but timer does not start if a game starts and a player leaves

GetArenaData();
CheckForDebug();

setInterval(function() {
    CheckGame();
}, 1000);


jcmp.events.Add('chat_command', (player, msg) => {
    if (msg == "/pos")
    {
        console.log(`x: ${player.position.x}, y: ${player.position.y}, z: ${player.position.z}`);
    }
});

function CheckGame()
{
    let players = jcmp.players.filter(p => p.ready == true);

    if (current_game == null)
    {
        if (players.length >= min_players && timer == null)
        {
            chat.broadcast(`[#FF0000][Deathmatch][#33FF81] A game will begin in ${wait_time} seconds at [#FF7300]${current_arena.defaults.name}[#33FF81]!`, new RGB(51,255,129));
            timer = setTimeout(function() {
                jcmp.events.CallRemote('FadeInCountdown', null);  
                timer = setTimeout(function() 
                {
                    players = jcmp.players.filter(p => p.ready == true);
                    if (players.length >= min_players && jcmp.players.length >= min_players)
                    {
                        let players_array = [];
                        players.forEach(function(player) 
                        {
                            players_array[player.networkId] = player;
                        });
                        chat.broadcast(`[#FF0000][Deathmatch][#33FF81] A new game has begun at [#FF7300]${current_arena.defaults.name}[#33FF81] with ${players_array.length} players! Get ready!`, new RGB(51,255,129));
                        StartGame(players_array, current_arena);
                        clearTimeout(timer);
                        timer = null;
                    }
                }, wait_time / 2 * 1000);
            }, wait_time / 2 * 1000);
        }
    }
    else if(current_game != null)
    {
        if (!testing_mode_on)
        {
            CheckIfGameShouldEnd(); // If we aren't testing with one person, do normal checks
        }
        if (current_game.active == true)
        {
            current_game.decrease_time();
        }
    }


}

function StartGame(players, arena)
{
    current_game = new dm.deathmatch(players, arena);
    current_game.start();
    let timeout = setTimeout(function() 
    {
        current_game.broadcast_border_shrink();
        let timeout = setTimeout(function() 
        {
            current_game.players.forEach(function(player) 
            {
                current_game.player_tied(player);
            });
            StopGame();
        }, current_game.defaults.showdown_time * 1000);
        current_game.timeouts.push(timeout);
    }, current_game.defaults.max_time * 1000 + 10000); // +10 seconds because of wait time at the beginning
    current_game.timeouts.push(timeout);
}

function GetArenaData()
{
    let num_arenas = 0;
    fs.readdir(__dirname + '/data/', function(err, filenames) {
        if (err) throw err;
        num_arenas = filenames.length;
        filenames.forEach(function(filename) {
            fs.readFile(__dirname + '/data/' + filename, 'utf8', function (err, data) {
            if (err) throw err;
                let obj = JSON.parse(data);
                arenas.push(obj);
            });
        })
        setTimeout(function() 
        {
            current_arena = arenas[Math.floor(Math.random() * arenas.length)];
            console.log(`[DEATHMATCH] ${num_arenas} arenas loaded!`);
        }, 500);
    });
}

jcmp.events.Add('PlayerCreated', (player) => {
    player.position = new Vector3f(3891.033203125, 1557.2899169921875, 687.85791015625);
    player.invulnerable = true;
    player.dimension = 1;
})

jcmp.events.Add('PlayerReady', (player) => {
    chat.send(player, `Welcome to [#FF0000]Deathmatch[#FFFFFF]! I hope you enjoy your stay here, [#FFFF00]${player.name}[#FFFFFF]. Good luck, and may the odds ever be in your favor.`, new RGB(255,255,255));
    console.log(`${player.name} has joined the game.`);
    if (current_game != null)
    {
        jcmp.events.CallRemote('SyncPlayersIngame', player, current_game.players.length);
        jcmp.events.CallRemote('SyncIngameTime', player, (current_game.current_time, current_game.showdown_mode));
    }
    player.ready = true;
    player.health = 800;
    player.invulnerable = true;
    player.dimension = 1;
    player.position = new Vector3f(3891.033203125, 1557.2899169921875, 687.85791015625);
    setTimeout(function() {
        jcmp.events.CallRemote('SyncOnlinePlayers', null, jcmp.players.length);
    }, 1000);
    chat.broadcast(`<i>${player.name} joined the game.</i>`, new RGB(184,167,151));
    jcmp.events.CallRemote('ChangeArena', player, JSON.stringify(current_arena.defaults.centerPoint));
    UpdateSteamImages(player);
})

function CheckIfGameShouldEnd()
{
    if (current_game.players.length <= 1)
    {
        StopGame();
    }
    else if (jcmp.players.length <= 1)
    {
        StopGame();
    }
}

function StopGame()
{
    current_game.players.forEach(function(player) 
    {
        current_game.player_won(player);
    });

    setTimeout(function() 
    {
        if (current_game != null)
        {
            current_game.end();
            current_game = null;
            current_arena = arenas[Math.floor(Math.random() * arenas.length)];
            jcmp.events.CallRemote('ChangeArena', null, JSON.stringify(current_arena.defaults.centerPoint));
        }
    }, 5500);
}

jcmp.events.Add('PlayerDeath', (player, killer, reason) => {
    if (current_game != null)
    {
        current_game.player_died(player);
        CheckIfGameShouldEnd();
    }
})

jcmp.events.Add('PlayerDestroyed', (player) => {
    //check if player is in the game, if so remove em
    console.log(`${player.name} has left the game.`)
    chat.broadcast(`<i>${player.name} left the game.</i>`, new RGB(184,167,151));
    if (current_game != null)
    {
        current_game.remove_player(player);
        CheckIfGameShouldEnd();
    }
    setTimeout(function() {
        jcmp.events.CallRemote('SyncOnlinePlayers', null, jcmp.players.length);
    }, 1000);
    steamData = steamData.filter(data => data.id != player.networkId);
    jcmp.events.CallRemote('RemoveSteamAvatar', player.networkId);
})

jcmp.events.Add('WeaponTimeoutRespawn', (index, respawn_time) => {
    current_game.timeouts.push(setTimeout(function() 
    {
        if (current_game != null)
        {
            current_game.broadcast_weap_respawn(index);
        }
    }, respawn_time));
})

jcmp.events.AddRemoteCallable('deathmatch/killfromleavingfield', (player) => {
    if (current_game != null)
    {
        player.health = 0;
    }
})

jcmp.events.AddRemoteCallable('PickupWeapon', (player, index) => {
    if (current_game != null)
    {
        current_game.pickup_weapon(player, index);
    }
})

function CheckForDebug()
{
    if (testing_mode_on)
    {
        wait_time = 7;
        min_players = 1;
    }
}

// Steam API testing
const steam = require('steam-web');

const s = new steam({
  apiKey: 'YOUR API KEY', // Your API key, found here: https://steamcommunity.com/dev/apikey
  format: 'json'
});

let steamData = [];

function UpdateSteamImages(player)
{
    s.getPlayerSummaries({
    steamids: [player.client.steamId],
    callback: function(err, data) 
    {
        data.response.players.forEach(function(steam_prof) 
        {
            let url = FormatUrl(steam_prof.avatarmedium);
            steamData.push({id: player.networkId, url: url});
        });
        jcmp.events.CallRemote('SteamAvatarURLUpdate', null, JSON.stringify(steamData));
    }
    });


}

// Format url to use whitelisted steam image domain
function FormatUrl(url)
{
    let base = "http://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/";
    url = url.substring(url.indexOf('/avatars/') + 9, url.length);
    url = base + url;
    return url;
}