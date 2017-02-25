
// Loads arenas from deathmatch/data
function GetArenaData()
{
    let arenas = [];
    //dm.fss.readdir(__dirname + '../data/', function(err, filenames) {
    dm.fss.readdir('./packages/deathmatch/data/', function(err, filenames) 
    {
        if (err) throw err;
        filenames.forEach(function(filename) 
        {
            dm.fss.readFile('./packages/deathmatch/data/' + filename, 'utf8', function (err, data) 
            {
                if (err) throw err;
                let obj = JSON.parse(data);
                if (obj.enabled)
                {
                    arenas.push(obj);
                }
            });
        })
        setTimeout(function() 
        {
            if (arenas.length == 0)
            {
                console.log(`[DEATHMATCH] [ERROR] No arenas loaded! Please check config files!`);
            }
            else
            {
                dm.game.current_arena = arenas[Math.floor(Math.random() * arenas.length)];
                dm.game.arenas = arenas;
                console.log(`[DEATHMATCH] ${dm.game.arenas.length} arenas loaded!`);
            }
        }, 500);
    });
}
GetArenaData();
