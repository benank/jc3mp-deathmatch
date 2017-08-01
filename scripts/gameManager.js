
const lang = require('./lang');
dm.lobby = [];

setInterval(() => 
{
    CheckGame();
}, 1000);

if (dm.config.integrated_mode)
{
    setInterval(() => 
    {
        IntegratedBroadcast();
    }, dm.config.integrated_settings.chat.broadcast_interval * 1000);
}

let wait_time = (dm.config.testing_settings.enabled) ? dm.config.testing_settings.wait_time : dm.config.game_settings.wait_time;
let min_players = (dm.config.testing_settings.enabled) ? dm.config.testing_settings.min_players : dm.config.game_settings.min_players;

let timer = null;
let timer2 = null;


// Continuously checks if a game should start or end
function CheckGame()
{
    if (dm.game.current_game == null)
    {
        if (dm.lobby.length >= min_players && timer == null && timer2 == null)
        {
            lang.broadcast(lang.formatMessage(lang.msgs.on_start_soon, {time: wait_time}));
            timer = setTimeout(function() 
            {
                if (dm.lobby.length >= min_players)
                {
                    dm.lobby.forEach(player =>
                    {
                        jcmp.events.CallRemote('dm/FadeInCountdown', player);
                    });
                    
                    timer2 = setTimeout(function() 
                    {
                        if (dm.lobby.length >= min_players)
                        {
                            let players_array = [];
                            dm.lobby.forEach(player =>
                            {
                                players_array[player.networkId] = player;
                            });
                            lang.broadcast(lang.formatMessage(lang.msgs.on_starting, {num_players: players_array.length}));
                            StartGame(players_array, dm.game.current_arena);
                        }
                        else if (dm.game.current_game == null)
                        {
                            dm.lobby.forEach(p => 
                            {
                                jcmp.events.CallRemote('dm/EndGame', p);
                                jcmp.events.CallRemote('dm/CleanupIngameUI', p);
                            });
                        }

                        if (dm.config.integrated_mode)
                        {
                            dm.lobby = []; // Reset lobby only if integrated mode is on
                        }
                        clearTimeout(timer2);
                        timer2 = null;
                    }, wait_time * 0.3 * 1000);
                }
                timer = null;
            }, wait_time * 0.7 * 1000);
        }
    }
    else if(dm.game.current_game != null)
    {
        if (!dm.config.testing_settings.enabled || jcmp.players.length == 0)
        {
            CheckIfGameShouldEnd(); // If we aren't testing with one person, do normal checks
        }

        if (dm.game.current_game.active)
        {
            dm.game.current_game.decrease_time();
        }
        else if (!dm.game.current_game.active && dm.game.current_game.get_num_loaded() >= min_players)
        {
            dm.game.current_game.begin_game();
        }

    }


}

// Starts a game with given players and arena data
function StartGame(players, arena)
{
    dm.game.current_game = new dm.deathmatch(players, arena);
    dm.game.current_game.start();
}

function CheckIfGameShouldEnd()
{
    if (dm.game.current_game.players.length <= 1)
    {
        StopGame();
    }
}

function StopGame()
{
    if (dm.game.current_game.players.length > 1)
    {
        dm.game.current_game.players.forEach(function(player) 
        {
            dm.game.current_game.player_tied(player);
        });
    }
    else if (dm.game.current_game.players.length == 1)
    {
        dm.game.current_game.players.forEach(function(player) 
        {
            dm.game.current_game.player_won(player);
        });
    }

    setTimeout(function() 
    {
        if (dm.game.current_game != null)
        {
            EndGame();
        }
        else
        {
            dm.game.current_game = null;
        }
    }, 5500);
}

function EndGame()
{
    dm.game.current_game.end();
    dm.game.current_game = null;
    dm.game.current_arena = dm.game.arenas[Math.floor(Math.random() * dm.game.arenas.length)];
    jcmp.events.CallRemote('dm/ChangeArena', null, JSON.stringify(dm.game.current_arena.defaults.centerPoint));
}

function IntegratedBroadcast()
{
    lang.broadcast(lang.formatMessage(lang.msgs.on_interval, {num_players: dm.lobby.length}));
}

function AddPlayerToLobby(player)
{
    dm.lobby.push(player);
}

function RemovePlayerFromLobby(player)
{
    dm.lobby = dm.lobby.filter(p => p != undefined || p != null || p.name != null);
    dm.lobby = dm.lobby.filter(p => p.networkId != player.networkId);
}

module.exports = 
{
    CheckIfGameShouldEnd,
    AddPlayerToLobby,
    RemovePlayerFromLobby,
    StopGame
}
