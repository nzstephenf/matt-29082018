$(function(){
    var filedir = document.location.href;
    var filename = filedir.substr(filedir.lastIndexOf('/') + 1).replace(".html","");
    
    // create variables with default
    var theme_primary = "#499999";
    var theme_secondary = "#2c7f7f";
    
    var cookie_delay = getCookie("overlay_delay_"+ filename);
    var cookie_duration = getCookie("overlay_duration_"+ filename);
    
    if(cookie_delay) delay = cookie_delay;
    if(cookie_duration) duration = cookie_duration;
    
    $.each(appData.theme, function(i, item){
        if(item.id === theme){
            if(item.info_bar_odd) theme_primary = item.info_bar_odd;
            if(item.info_bar_even) theme_secondary = item.info_bar_even;
        }
    });
    
    // with default and themes out of the way, now to see if we should override by colour theme provided in data on attribute
    if($(".fb-supporter-cta").attr("data-primary")) theme_primary = $(".fb-supporter-cta").attr("data-primary");
    if($(".fb-supporter-cta").attr("data-secondary")) theme_secondary = $(".fb-supporter-cta").attr("data-secondary");
    
    $(".fb-supporter-cta-header").css("background-image", "linear-gradient(to bottom right, black, "+ theme_primary +")");
    $(".fb-supporter-cta-footer").css("background-image", "linear-gradient(to top left, black, "+ theme_secondary +")");
    
    var minuteHelper = 60 * 1000;
    var usedDuration = duration * 1000; // 10 duration would be 10000 (10 seconds)
    var usedDelay = delay * minuteHelper;
    
    // run animation in a loop. delayed 
    setTimeout(function(){
        runAnimation();
    }, 1.5 * 1000);
    
    function togglePerk(){
        if(!$(".fb-supporter-cta-content li").hasClass("active")) $(".fb-supporter-cta-content li:first").addClass("active");
        
        perkInterval = setInterval(function(){
            if($(".fb-supporter-cta-content li:last-child").hasClass("active")){
                $(".fb-supporter-cta-content li:last-child.active").removeClass("active");
                clearInterval(perkInterval);
                endAnimation();
            } else {
                $(".fb-supporter-cta-content li.active").removeClass("active").next().addClass("active");
            }
        }, 5 * 1000);
    }
    
    function runAnimation(){
        $(".fb-supporter-cta-header").addClass("active");
        
        setTimeout(function(){
            $(".fb-supporter-cta-footer").addClass("active");
            
            setTimeout(function(){
                $(".fb-supporter-cta-content-item:first-child").addClass("active");
                togglePerk();
            }, 420);
        }, 200);
    }
    
    function endAnimation(){
        setTimeout(function(){
            $(".fb-supporter-cta-footer").removeClass("active");

            setTimeout(function(){
                $(".fb-supporter-cta-header").removeClass("active");
                
                setTimeout(function(){
                    runAnimation();
                }, 5 * 60000);
            }, 200);            
        }, 300);
    }
    
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    
});