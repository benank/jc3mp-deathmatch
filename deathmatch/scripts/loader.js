
// Loads arenas from deathmatch/data
function GetArenaData()
{
    let num_arenas = 0;
    let arenas = [];
    //dm.fss.readdir(__dirname + '../data/', function(err, filenames) {
    dm.fss.readdir('./packages/deathmatch/data/', function(err, filenames) {
        if (err) throw err;
        num_arenas = filenames.length;
        filenames.forEach(function(filename) {
            dm.fss.readFile('./packages/deathmatch/data/' + filename, 'utf8', function (err, data) {
            if (err) throw err;
                let obj = JSON.parse(data);
                arenas.push(obj);
            });
        })
        setTimeout(function() 
        {
            dm.game.current_arena = arenas[Math.floor(Math.random() * arenas.length)];
            dm.game.arenas = arenas;
            console.log(`[DEATHMATCH] ${num_arenas} arenas loaded!`);
        }, 500);
    });
}
GetArenaData();
