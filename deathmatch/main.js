
global.dm = 
{
    deathmatch: require('./scripts/deathmatch'),
    config: require('./config'),
    fss: require('fs'),
    chat: jcmp.events.Call('get_chat')[0],
    game: {current_game: null, current_arena: null, arenas: []},
    steam: require('steam-web')

}

require('./scripts/gameManager');
require('./scripts/steam');
require('./scripts/loader');
require('./scripts/events');

setInterval(() => {}, 500); // If things break because NODEJS, this will make them work again