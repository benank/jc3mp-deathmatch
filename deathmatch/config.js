module.exports =
{
    steam_api_key: "YOUR STEAM API KEY HERE",  // Your steam API key, found here: https://steamcommunity.com/dev/apikey
    integrated_mode: false,
    /*
    ingtegrated_mode: false - This will cause the Deathmatch package to run as a standalone package. This means that you should not
        run the freeroam script alongside it. Players will sit in a menu until there are enough to begin, then everyone in the server
        will be placed into the arena. Use this mode if you want deathmatch as the primary gamemode on your server.

    ingtegrated_mode: true - This will cause the Deathmatch package to run as a readily integrable package, meaning that you can drop
        this into your server that has freeroam running on it and it will function properly. This means that Deathmatch will regularly
        broadcast messages to chat about the games, and players will be able to join with the command set in settings.
    */
    game_settings: // General game settings
    {
        wait_time: 20, // Wait time before game starts after there are enough players
        min_players: 2 // Minimum players to start a game
    },
    testing_settings: // Don't change these unless you are testing/developing this
    {
        enabled: false, // Whether or not testing mode is active and these settings will override the others
        wait_time: 7,
        min_players: 1
    },
    chat_settings: // Settings relating to chat messages
    {
        enabled: true, // Whether or not Deathmatch will send chat messages at all
        on_join_leave: true, // Whether a chat message will be broadcasted when someone joins the server, auto-false if integrated mode is true
        welcome: true, // Whether the welcome message will be sent to players on join, auto-false if integrated mode is true
        prefix: // Prefix to all messages sent by Deathmatch
        {
            name: "[Deathmatch]", 
            color: "[#FF0000]"
        },
        body_color: "[#33FF81]", // Color of the body of the messages
        arena_color: "[#FF7300]", // Color of the arena names 
        welcome_color: "[#FFFFFF]", // Color of the body of the welcome message
        server_js_color: "[#B8A797]", // Color of the message when a player joins/leaves the server
        player_color: "[#FFFF00]" // Color of player names
    },
    integrated_settings: // Settings that will only be used if you set integrated_mode to true
    {
        command: "/deathmatch", // Command that players will use to join
        chat: // Integrated specific chat settings
        {
            broadcast_interval: 60, // Messages will be broadcast to encourage players to join on this interval
            game_start_soon: true, // A message will be broadcast when a game is starting soon
            game_ended: true // A message will be broadcast when a game ends
        },
        dimension: 2 // The dimension that games should take place in (please don't set this to 0)
    }
}