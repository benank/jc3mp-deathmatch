// Getting players' steam avatars
dm.avatars = [];
const s = new dm.steam({ apiKey: dm.config.steam_api_key, format: 'json'})

function UpdateSteamImages(player)
{
    s.getPlayerSummaries({
    steamids: [player.client.steamId],
    callback: function(err, data) 
    {
        data.response.players.forEach(function(steam_prof) 
        {
            let avatar_url = FormatUrl(steam_prof.avatarmedium);
            dm.avatars.push({id: player.networkId, url: avatar_url});
        });
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

module.exports = 
{
    UpdateSteamImages
}
