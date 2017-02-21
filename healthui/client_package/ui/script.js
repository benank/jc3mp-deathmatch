$(function(){

    jcmp.AddEvent('healthui/updatehealth', (num) => {
        let hp = ((1 - num) * 100) + "%";
        let path = "polygon(0 " + hp + ", 100% " + hp + ", 100% 100%, 0 100%)";
        $("div.inside").css({"clip-path": path});
    })

})