let integrated_ui = true;
let num_players = 0;
let num_ingame = 0;
let defaults;
let countdownTime = 0;
let center = new Vector3f(0,0,0);
let diameter = new Vector2f(0,0);
let delta = 0;
const leaving_field_default_time = 15;
let leaving_field_time = leaving_field_default_time;
let leaving_field = false;
let countdown_sound = false;
let weaponSpawns;
let near_weapons = [];
const pickup_dist = 1.25;
const detect_dist = 150;
let shrink_border = false;
let shrink_size = 0;
let steam_urls = [];
let camera_position = new Vector3f(0,0,0);
let localplayer = jcmp.players.find(p => p.networkId == jcmp.localPlayer.networkId);
let override_utility = false;
let spectating = false;
let spectating_player = null;
let ingame = false;
let can_spec = true;
let to_pos = new Vector3f(0,0,0);
let to_rot = new Vector3f(0,0,0);
let m = CreateNewBorderMatrix();
let pois = [];



const weathers = 
[
    'base',
    'rain',
    'overcast',
    'thunderstorm',
    'fog',
    'snow'
];

