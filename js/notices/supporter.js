$(function(){
    var filedir = document.location.href;
    var filename = filedir.substr(filedir.lastIndexOf('/') + 1).replace(".html","");
    
    var $supportercounter = $("#supporter-counter-container");
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
        if($("#supporter-goal-container").hasClass("infobar-top")){
            if($("#supporter-counter-container").hasClass("top-right")){
                $("#supporter-counter-back").removeClass("active"); 

                setTimeout(function(){
                    $("#supporter-counter").removeClass("active");
                    $("#supporter-counter-progress-bar").css("width", "0%");
                }, 500);
            }
        }
        
        setTimeout(function(){
            $(".fb-supporter-cta-header").addClass("active");

            setTimeout(function(){
                $(".fb-supporter-cta-footer").addClass("active");

                setTimeout(function(){
                    $(".fb-supporter-cta-content-item:first-child").addClass("active");
                    togglePerk();
                }, 400);
            }, 200);
        }, 900);
    }
    
    function endAnimation(){
        setTimeout(function(){
            $(".fb-supporter-cta-footer").removeClass("active");

            setTimeout(function(){
                $(".fb-supporter-cta-header").removeClass("active");
                
                setTimeout(function(){
                    if(activeSupporter["state"] === true){
                        if($("#supporter-counter-container").hasClass("top-right")){
                            $("#supporter-counter-back").addClass("active"); 

                            setTimeout(function(){
                                $("#supporter-counter").addClass("active");   
                                UpdateSupporterGoalProgressBar();
                            }, 900);
                        }
                    }
                }, 900);
                
                setTimeout(function(){
                    runAnimation();
                }, 5 * 60000);
            }, 200);            
        }, 400);
    }
    
    function UpdateSupporterGoalProgressBar(){
         // set to zero
        $("#supporter-counter-progress-bar").css("width", "0%");
        
        setTimeout(function(){
            var supporterPercentage = (supportersOverlay["current"] / supportersOverlay["goal"] * 100);
            $("#supporter-counter-progress-bar").css("width", supporterPercentage + "%");
        }, 1500);
    }
    
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    
});