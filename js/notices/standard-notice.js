$(function(){
    var filedir = document.location.href;
    var filename = filedir.substr(filedir.lastIndexOf('/') + 1).replace(".html","");
    
    // create variables with default
    var theme_primary = "#499999";
    var theme_secondary = "#2c7f7f";
    
    var SupporterStoredData = localStorage.getItem("supporters-overlay"), NoticeStoredData = localStorage.getItem("notice-cta");
    var activeSupporter = (SupporterStoredData) ? JSON.parse(SupporterStoredData) : {}, activeNotice = (NoticeStoredData) ? JSON.parse(NoticeStoredData) : {};
    var delay = 5, duration = 30;
    
    if(activeNotice["delay"]) delay = activeNotice["delay"];
    if(activeNotice["duration"]) duration = activeNotice["duration"];
    
    $.each(appData.theme, function(i, item){
        if(item.id === theme){
            if(item.info_bar_odd) theme_primary = item.info_bar_odd;
            if(item.info_bar_even) theme_secondary = item.info_bar_even;
        }
    });
    
    // with default and themes out of the way, now to see if we should override by colour theme provided in data on attribute
    if($(".standard-notice").attr("data-primary")) theme_primary = $(".standard-notice").attr("data-primary");
    if($(".standard-notice").attr("data-secondary")) theme_secondary = $(".standard-notice").attr("data-secondary");
    
    $(".start-bar-item").css("background", theme_primary);
    $(".content-bar-item").css("background-image", "linear-gradient(to bottom right, black, "+ theme_secondary +")");
    
    var minuteHelper = 60 * 1000;
    var usedDuration = duration * 1000; // 10 duration would be 10000 (10 seconds)
    var usedDelay = delay * minuteHelper;
    
    // run animation in a loop. delayed 
    runAnimation();
    
    function runAnimation(){
        $(".start-bar-item").addClass("active");
        
        setTimeout(function(){
            $(".content-bar-item").addClass("active");
            
            setTimeout(function(){
                $(".content-bar-item .content").addClass("active");
                if($(".extra-strand")) $(".extra-strand").addClass("active");
            }, 120);
        }, 500);
        
        // end
        setTimeout(function(){
            $(".content-bar-item .content").removeClass("active");

            setTimeout(function(){
                $(".content-bar-item").removeClass("active");
                if($(".extra-strand")) $(".extra-strand").removeClass("active");
            }, 120);
            
            setTimeout(function(){
                $(".start-bar-item").removeClass("active");
            }, 600);
            
            setTimeout(function(){
                runAnimation();
            }, usedDelay);
        }, usedDuration);
    }
    
    
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    
});