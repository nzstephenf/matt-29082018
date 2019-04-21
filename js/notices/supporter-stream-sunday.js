$(function(){
    var filedir = document.location.href;
    var filename = filedir.substr(filedir.lastIndexOf('/') + 1).replace(".html","");
    
    var $supportercounter = $("#supporter-goal-container");
    // create variables with default
    var theme_primary = "#499999";
    var theme_secondary = "#2c7f7f";
    
    var SupporterStoredData = localStorage.getItem("supporters-overlay"), NoticeStoredData = localStorage.getItem("notice-cta");
    var activeSupporter = (SupporterStoredData) ? JSON.parse(SupporterStoredData) : {}, activeNotice = (NoticeStoredData) ? JSON.parse(NoticeStoredData) : {};
    var delay = 5, duration = 30;
    
    if(activeNotice["delay"]) delay = activeNotice["delay"];
    if(activeNotice["duration"]) duration = activeNotice["duration"];
    
    $("#supporter-only-stream-gradient span").css("background-image", "linear-gradient(to bottom, "+ activeOverlay["info_bar_odd"] +" 0%, rgba(0,0,0,0) 100%)");
    $("span[data-game-info]").text(activeOverlay["game_name"]);
    $("span[data-platform-info]").text(activeOverlay["platform"]);
    $("#supporter-only-stream-right-sub-count").css("color", activeOverlay["info_bar_odd"]);
    $("span[data-current-supporter-count]").css("color", activeOverlay["info_bar_even"]);
    $("span[data-current-supporter-count]").text(activeSupporterGoal["current"]);
    
    CompactInfoBar();
    
    function CompactInfoBar(){
        setTimeout(function(){
            if(!$("#supporter-only-scroll ul li").hasClass("active")) $("#supporter-only-scroll ul li:first").addClass("active");

            compactInfoBarInterval = setInterval(function(){

                if($("#supporter-only-scroll ul li:last-child").hasClass("active")){
                    $("#supporter-only-scroll ul li:last-child.active").removeClass("active");
                    clearInterval(compactInfoBarInterval);
                    $("#supporter-only-scroll ul li:first").addClass("active");

                    setTimeout(function(){
                        CompactInfoBar();
                    }, 60 * 1000); //TODO switch back to 120
                } else {
                    $("#supporter-only-scroll ul li.active").removeClass("active").next().addClass("active");
                }
            }, 5 * 1000);
        }, 2000);
    }
    
    
});