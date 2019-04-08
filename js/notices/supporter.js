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
    }, 3.5 * 1000);
    
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
        // run this every time to keep up to date
        activeSupporter = JSON.parse(localStorage.getItem("supporters-overlay"));
        
        if(activeSupporter["state"] === true && $("#supporter-goal").hasClass("active")){
            if($("#supporter-goal-container").hasClass("top-right")){
                $("#supporter-goal-progress-bar").css("width", "0%");
                
                setTimeout(function(){
                    $("#supporter-goal").toggleClass("active end-animation");
                    $("#supporter-goal-white").toggleClass("active end-animation"); 
                    $("#supporter-goal-bg").toggleClass("active end-animation"); 

                    // remove class
                    setTimeout(function(){
                        $("#supporter-goal-white").removeClass("active end-animation");
                        $("#supporter-goal-bg").removeClass("active end-animation");
                        $("#supporter-goal").removeClass("active end-animation");
                    }, 500);
                }, 1000);
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
        }, 1000);
    }
    
    function endAnimation(){
        setTimeout(function(){
            $(".fb-supporter-cta-footer").removeClass("active");

            setTimeout(function(){
                $(".fb-supporter-cta-header").removeClass("active");
                
                setTimeout(function(){
                    if(activeSupporter["state"] === true){
                        if($("#supporter-goal-container").hasClass("top-right")){
                            $("#supporter-goal-white").addClass("active"); 
                            $("#supporter-goal-bg").addClass("active"); 

                            setTimeout(function(){
                                $("#supporter-goal").addClass("active");   
                                UpdateSupporterGoalProgressBar();
                            }, 900);
                        }
                    }
                }, 900);
                
                if(activeSupporter["state"] === true){
                    setTimeout(function(){
                        if($("#supporter-goal-container").hasClass("top-right")){
                            $("#supporter-goal-progress-bar").css("width", "0%");

                            setTimeout(function(){
                                $("#supporter-goal").toggleClass("active end-animation");

                                setTimeout(function(){
                                    $("#supporter-goal-white").toggleClass("active end-animation"); 
                                    $("#supporter-goal-bg").toggleClass("active end-animation"); 

                                    // remove class
                                    setTimeout(function(){
                                        $("#supporter-goal-white").removeClass("active end-animation");
                                        $("#supporter-goal-bg").removeClass("active end-animation");
                                        $("#supporter-goal").removeClass("active end-animation");
                                    }, 500);
                                }, 1000);
                            }, 500);
                        }
                    }, 15 * 1000);
                }
                
                setTimeout(function(){
                    runAnimation();
                }, 320 * 1000);
            }, 200);            
        }, 400);
    }
    
    function UpdateSupporterGoalProgressBar(){
         // set to zero
        $("#supporter-goal-progress-bar").css("width", "0%");
        
        setTimeout(function(){
            var supporterPercentage = (activeSupporter["current"] / activeSupporter["goal"] * 100);
            $("#supporter-goal-progress-bar").css("width", supporterPercentage + "%");
        }, 1500);
    }
    
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
    
});