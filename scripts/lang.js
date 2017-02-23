const msgs =
{
    on_join: "${dm.config.chat_settings.prefix.color}${dm.config.chat_settings.prefix.name} ${dm.config.chat_settings.body_color}" +
     "You have entered the lobby! You will be added to the next game.",
    on_leave: "${dm.config.chat_settings.prefix.color}${dm.config.chat_settings.prefix.name} ${dm.config.chat_settings.body_color}" +
     "You have left the lobby!",
    on_start_soon: "${dm.config.chat_settings.prefix.color}${dm.config.chat_settings.prefix.name} ${dm.config.chat_settings.body_color}" +
     "A game will begin in ${time} seconds at ${dm.config.chat_settings.arena_color}${dm.game.current_arena.defaults.name}" +
     "${dm.config.chat_settings.body_color}!",
    on_starting: "${dm.config.chat_settings.prefix.color}${dm.config.chat_settings.prefix.name} ${dm.config.chat_settings.body_color}" +
     "A new game has begun at ${dm.config.chat_settings.arena_color}${dm.game.current_arena.defaults.name} " +
     "${dm.config.chat_settings.body_color} with ${num_players} players!",
    on_ended: "${dm.config.chat_settings.prefix.color}${dm.config.chat_settings.prefix.name} ${dm.config.chat_settings.body_color}" +
     "A game just finished at ${dm.config.chat_settings.arena_color}${dm.game.current_arena.defaults.name}" +
     "${dm.config.chat_settings.body_color}! ${dm.config.chat_settings.player_color}${winner} ${dm.config.chat_settings.body_color}won!",
    on_ended_tie: "${dm.config.chat_settings.prefix.color}${dm.config.chat_settings.prefix.name} ${dm.config.chat_settings.body_color}" +
     "A game just finished at ${dm.config.chat_settings.arena_color}${dm.game.current_arena.defaults.name}" +
     "${dm.config.chat_settings.body_color}! Tie game between ${num_players} players!",
    on_ended_die: "${dm.config.chat_settings.prefix.color}${dm.config.chat_settings.prefix.name} ${dm.config.chat_settings.body_color}" +
     "A game just finished at ${dm.config.chat_settings.arena_color}${dm.game.current_arena.defaults.name}" +
     "${dm.config.chat_settings.body_color}! It was a bloodbath, and everyone died!",
    on_border_shrink: "${dm.config.chat_settings.prefix.color}${dm.config.chat_settings.prefix.name} ${dm.config.chat_settings.body_color}" +
     "The borders are closing in! Head to the center of the arena quickly!",
    on_interval: "${dm.config.chat_settings.prefix.color}${dm.config.chat_settings.prefix.name} ${dm.config.chat_settings.body_color}" +
     "Type ${dm.config.chat_settings.prefix.color}${dm.config.integrated_settings.command}${dm.config.chat_settings.body_color} " +
     "to enter the lobby! Currently there are ${num_players} players in the lobby.",
     on_welcome: "Welcome to ${dm.config.chat_settings.prefix.color}Deathmatch${dm.config.chat_settings.welcome_color}! I hope you enjoy your " +
     "stay here, ${dm.config.chat_settings.player_color}${name}${dm.config.chat_settings.welcome_color}. Good luck!",
     on_s_join: "<i>${dm.config.chat_settings.server_js_color}${name} joined.</i>",
     on_s_leave: "<i>${dm.config.chat_settings.server_js_color}${name} left.</i>"
}
    /*chat_settings: // Settings relating to chat messages
    {
        enabled: true, // Whether or not Deathmatch will send chat messages at all
        prefix: // Prefix to all messages sent by Deathmatch
        {
            name: "[Deathmatch]", 
            color: "[#FF0000]"
        },
        body_color: "[#33FF81]", // Color of the body of the messages
        arena_color: "[#FF7300]", // Color of the arena names 
        player_color: "[#FFFF00]" // Color of player names*/

function broadcast(message)
{
    if (dm.config.chat_settings.enabled)
    {
        dm.chat.broadcast(message);
    }
}

function send(player, message)
{
    if (dm.config.chat_settings.enabled)
    {
        dm.chat.send(player, message);
    }
}

function formatMessage(template, scope)
{
    return evalTemplate(template, scope);
}

function evalTemplate(template, scope) 
{
    with(scope) 
    {
        try 
        {
            return eval(`\`${template.replace(/`/g, '\\`')}\``);
        } 
        catch (error) 
        {
            console.log("Error encountered while evaluating a template:");
            console.log(`Message: ${error.message}`);
            console.log(`Stack trace: \n${error.stack}`);
        }
    }
}





module.exports = 
{
    msgs,
    formatMessage,
    broadcast,
    send
}