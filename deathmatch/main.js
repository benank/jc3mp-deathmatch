
global.dm = 
{
    deathmatch: require('./scripts/deathmatch'),
    config: require('./config'),
    fss: require('fs'),
    chat: jcmp.events.Call('get_chat')[0],
    game: {current_game: null, current_arena: null, arenas: []},
    steam: require('steam-web')

}

// people crash right when GAME START and then the other players who are loaded get infinite black screen
// other people's names appear on peoples heads
// fades to black but timer does not start if a game starts and a player leaves
// sometimes fades to black when a player leaves but GAME START has not happened

require('./scripts/gameManager');
require('./scripts/steam');
require('./scripts/loader');
require('./scripts/events');

setInterval(() => {}, 500); // If things break because NODEJS, this will make them work again