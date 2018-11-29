/**
 * Intermission Screen
 */
var layout_id, supporterOverlay = {}, countdownInt, countdown = {}, social_id = "default", appData = {}, activeLayout = {}, socialData = {}, videoPlayer = document.getElementById("video-source");

$(function(){
    var $screen_id = $("html").attr("data-screen");
    
    var supporters_current = getCookie("supporters_overlay_current");
    var supporters_total = getCookie("supporters_overlay_total");
    var countdown_data__timestamp = getCookie("countdown_timestamp"); // to check if since last time "update countdown" has happened
    var countdown_data__brb = getCookie("countdown_visible_brb"); // to keep/add on screen
    var countdown_data__startingsoon = getCookie("countdown_visible_startingsoon"); // to keep/add on screen
    var countdown_data__state = getCookie("countdown_state"); // to keep the countdown going or halt
    var countdown_data__minute = getCookie("countdown_minutes");
    var countdown_data__second = getCookie("countdown_seconds");
    if(getCookie($screen_id + "_social_id")) social_id = getCookie($screen_id + "_social_id");
    
    getAppDataLayouts();
    
    function getAppDataLayouts(){
        $.ajax({
            url: "/app/data/screens.json",
            async: false,
            dataType: "json",
            success: function(data){
                appData = data;
            }
        });
    
        // Get shell
        $.ajax({
            url: "/app/layouts/intermission-screen/global-alternative.html",
            async: false,
            dataType: "html",
            success: function(data){
                $("div#container").append(data);
            }
        });
    
        setActiveLayout();
        
        
        /* Set up the countdown object */
        countdown = {
            "timestamp": countdown_data__timestamp,
            "visible_brb": countdown_data__brb,
            "visible_startingsoon": countdown_data__startingsoon,
            "state": countdown_data__state,
            "minute": countdown_data__minute,
            "second": countdown_data__second
        };
        
        if($("html").attr("data-screen") === "brb") $("#screen-countdown").attr("data-countdown-visible", countdown["visible_brb"]);
        if($("html").attr("data-screen") === "starting-soon") $("#screen-countdown").attr("data-countdown-visible", countdown["visible_startingsoon"]);
        
        if(countdown["state"] === "true"){
            $("#screen-countdown").addClass("active");
            startCountdown();
        }
        
        $("[data-countdown-minute]").text(countdown["minute"]);
        $("[data-countdown-second]").text(countdown["second"]);
        
        supporterOverlay["show"] = "true";
        
        /** manage how supporter overlay appears (if it should) **/
        if(supporters_current){
            supporterOverlay["current"] = supporters_current;
        } else {
            supporterOverlay["current"] = 0;
        }
        
        if(supporters_total){
            supporterOverlay["goal"] = supporters_total;
            supporterOverlay["target"] = supporters_total; // alias
        } else {
            supporterOverlay["goal"] = 100;
            supporterOverlay["target"] = 100; // alias
        }
        
        supporterOverlay["position"] = "bottom-left";
        $("#supporter-counter-container").addClass(supporterOverlay["position"]);
        $("#supporter-counter").addClass("active");
        
        $("[data-current-counter]").text(supporterOverlay["current"]);
        $("[data-total-counter]").text(supporterOverlay["goal"]);
    }
    
    function setActiveLayout(){
        $.each(appData.screen, function(i, layoutItem){
            if(layoutItem.id === $screen_id){
                layout_id = layoutItem.id;
                activeLayout["title"] = layoutItem.title;
                activeLayout["title_secondary"] = layoutItem.title_secondary;
                activeLayout["social_cta"] = layoutItem.social_cta;
                activeLayout["countdown"] = layoutItem.countdown;
                activeLayout["video"] = layoutItem.video;
                activeLayout["show_chairhinki"] = layoutItem.show_chairhinki;
                activeLayout["colours"] = layoutItem.colours;
                activeLayout["footer"] = layoutItem.footer;
                activeLayout["quotes"] = layoutItem.chairhinki;
                activeLayout["chairhinki"] = layoutItem.chairhinki;
            }
        });
        
        $.each(appData.social, function(i, socialItem){
            if(i === social_id) activeLayout["social"] = socialItem;
        });
        
        setupShell();
    }
    
    // Check for updates every 5 seconds
    supporterGoalInterval = setInterval(function(){
        checkForSupporterUpdates();
    }, 5 * 1000);
    
    checkCountdownUpdates = setInterval(function(){
        checkForCountdownUpdates();
    }, 1 * 1000);
    
    function checkForCountdownUpdates(){
        var changesDetected = {
            "timestamp": false,
            "visible_brb": false,
            "visible_startingsoon": false,
            "state": false,
            "minute": false,
            "second": false
        };
        
        var cachedTimestamp = countdown["timestamp"], cachedVisibleBrb = countdown["visible_brb"], cachedVisibleStartingSoon = countdown["visible_startingsoon"],
            cachedMinute = countdown["minute"], cachedSecond = countdown["second"], cachedState = countdown["state"];

        if(getCookie("countdown_timestamp") !== cachedTimestamp) changesDetected["timestamp"] = true;
        if(getCookie("countdown_visible_brb") !== cachedVisibleBrb) changesDetected["visible_brb"] = true;
        if(getCookie("countdown_visible_startingsoon") !== cachedVisibleStartingSoon) changesDetected["visible_startingsoon"] = true;
        if(getCookie("countdown_state") !== cachedState) changesDetected["state"] = true;
        
        if(changesDetected["timestamp"] === true) updateCountdown("timestamp", getCookie("countdown_timestamp"));
        if(changesDetected["state"] === true) updateCountdown("state", getCookie("countdown_state"));
        if(changesDetected["visible_brb"] === true) updateCountdown("visible_brb", getCookie("countdown_visible_brb"));
        if(changesDetected["visible_startingsoon"] === true) updateCountdown("visible_startingsoon", getCookie("countdown_visible_startingsoon"));
    }
    
    function updateCountdown(type = "state", value = ""){
        countdown[type] = value;
        
        switch(type){
            case "timestamp":
                console.log(countdown);
                break;
            case "state":
                if(value === "true"){
                    $("#screen-countdown").addClass("active");
                    startCountdown();
                } else {
                    $("#screen-countdown").removeClass("active");
                    stopCountdown();
                }
                break;
            case "visible_brb":
                if($("html").attr("data-screen") === "brb"){
                    if(value === "true"){
                        $("#screen-countdown").attr("data-countdown-visible", true);
                    } else {
                        $("#screen-countdown").attr("data-countdown-visible", false);
                    }
                }
                break;
            case "visible_startingsoon":
                if($("html").attr("data-screen") === "starting-soon"){
                    if(value === "true"){
                        $("#screen-countdown").attr("data-countdown-visible", true);
                    } else {
                        $("#screen-countdown").attr("data-countdown-visible", false);
                    }
                }
                break;
        }
    }
    
    function checkForSupporterUpdates(){
        var changesDetected = false;
        var cachedCurrent = supporterOverlay["current"];
        var cachedGoal = supporterOverlay["goal"];
        
        if(getCookie("supporters_overlay_current") !== cachedCurrent) changesDetected = true;
        if(getCookie("supporters_overlay_total") !== cachedGoal) changesDetected = true;
        if(changesDetected) restartSupporterGoal();
    }
    
    function updateSupporterProgressBar(){
        // set to zero
        $("#supporter-counter-progress-bar").css("width", "0%");
        
        setTimeout(function(){
            var supporterPercentage = (supporterOverlay["current"] / supporterOverlay["goal"] * 100);
            $("#supporter-counter-progress-bar").css("width", supporterPercentage + "%");
        }, 1500);
    }
    
    // remove from screen and restart animation
    function restartSupporterGoal(){
        supporterOverlay["current"] = getCookie("supporters_overlay_current");
        supporterOverlay["goal"] = getCookie("supporters_overlay_total");
        supporterOverlay["total"] = supporterOverlay["goal"];
        supporterOverlay["position"] = "bottom-left";
        supporterOverlay["show"] = "true";
        
        var $sc_container = $("#supporter-counter-container");
        
        if(supporterOverlay["show"] === "true"){
            setTimeout(function(){
                if($("#supporter-counter").hasClass("active")) $("#supporter-counter").removeClass("active");
            
                setTimeout(function(){
                    $("#supporter-counter-container").removeAttr("class");
                    $("#supporter-counter-container").addClass(supporterOverlay["position"]);
                }, 1000);
            }, 1000);
            
            setTimeout(function(){
                $("[data-current-counter]").text(supporterOverlay["current"]);
                $("[data-total-counter]").text(supporterOverlay["total"]);

                setTimeout(function(){
                    $("#supporter-counter-back").addClass("active"); 
                    
                    setTimeout(function(){
                        $("#supporter-counter").addClass("active");            
                        updateSupporterProgressBar();
                    }, 500);        
                }, 500);
            }, 2500);
        } else {
            setTimeout(function(){
                $("#supporter-counter").removeClass("active");     
                
                setTimeout(function(){
                    $("#supporter-counter-back").removeClass("active");     
                }, 500);
            }, 2500);
        }
    }
    
    function setupShell(){
        document.title = activeLayout["title"];
        $("#screen-title span").text(activeLayout["title"]);
        $("#screen-title span").css("color", activeLayout["colours"]["secondary"]);
        $("#screen-social-cta span").text(activeLayout["social_cta"]);
        $("#screen-social-cta span").css("color", activeLayout["colours"]["light"]);
        
        $("#screen-top-left").css("background", activeLayout["colours"]["dark"]);
        $("#screen-top-right").css("background", activeLayout["colours"]["dark"]);
        $("#supporter-counter").css("background", activeLayout["colours"]["dark"]);
        
        $("[data-current-counter]").text(supporterOverlay["current"] + "TEST");
        $("[data-total-counter]").text(supporterOverlay["goal"]);
        updateSupporterProgressBar();
        
        $.each(activeLayout["social"], function(i, socialObj){
            $("#screen-social ul").append(
                    "<li>\n\
                        <div class=\"top\"><i class=\"fab fa-"+socialObj.icon+"\"></i> "+socialObj.line_one+"</div>\n\
                        <div class=\"bottom\">"+socialObj.line_two+"</div>\n\
                    </li>");
        });
        $("#screen-social li .top").css("color", activeLayout["colours"]["light"]);
        
        $("#video-mask").css("background-image", "linear-gradient(-40deg, black, "+ activeLayout["colours"]["primary"] +")");
        $("#video-source").attr("src", activeLayout["video"]);
    }
    
    function startCountdown(pauseCountdown = false){
        countdown["minute"] = getCookie("countdown_minute");
        countdown["second"] = getCookie("countdown_second");
        
        countdownInt = setInterval(function(){
            if(countdown["minute"] === 0 && countdown["second"] === 0){
                stopCountdown();
                console.log("Countdown halt!");
            } else {
                decrementTimer();
                console.log("Countdown more");
            }
        }, 1 * 1000); // every second
    }
    
    function stopCountdown(){
        countdown["active"] = false;
        clearInterval(countdownInt);
        if($("#screen-countdown").hasClass("active")) $("#screen-countdown").removeClass("active");
    }
    
    function incrementTimer(){
        var maxMinute = 59, maxSecond = 59, minMinute = 00, minSecond = 00;
        
        if(countdown["minute"] === minMinute && countdown["second"] === minSecond) stopCountdown();
        
        if(countdown["second"] <= maxSecond){
            countdown["second"]++;
        } else {
            countdown["minute"]++;
            countdown["second"] = minSecond; // reset back to zero
        }
    }
    
    function decrementTimer(){
        var maxMinute = 59, maxSecond = 59, minMinute = 00, minSecond = 00;
        
        if(countdown["second"] > minSecond){
            countdown["second"]--;
            $("span[data-countdown-minute]").text(getCountdown("minute"));
            $("span[data-countdown-second]").text(getCountdown("second"));
        } else {
            if(countdown["minute"] > 0) countdown["minute"]--;
            countdown["second"] = maxSecond; // reset back to zero
            $("span[data-countdown-minute]").text(getCountdown("minute"));
            $("span[data-countdown-second]").text(getCountdown("second"));
        }
    }
});

function getCountdown(type = "second"){
    var cMinute, cSecond;
    
    switch(type){
        case "minute":
            if(countdown["minute"] <= 9){
                cMinute = "0"+ countdown["minute"];
            } else {
                cMinute = countdown["minute"];
            }
            return cMinute;
            break;
        case "second":
            if(countdown["second"] <= 9){
                cSecond = "0"+ countdown["second"];
            } else {
                cSecond = countdown["second"];
            }
            return cSecond;
            break;
    }
}

/**
 * Get cookies based on name
 */
function getCookie(name){
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

/**
 * Set cookies for the app
 */
function setCookie(name, value){
    document.cookie = name +"="+ value +"; expires=Tue, 1 Jan 2030 12:00:00 UTC";
}

function setSupporterCookie(name, value){
    document.cookie = name +"="+ value +"; expires=Tue, 1 Jan 2030 12:00:00 UTC /";
}

/**
 * Remove cookies from browser by making it expire
 */
function removeCookie(name){
    document.cookie = name + "=; expires=Mon, 01 Jan 2018 00:00:00 GMT;";
}

function removeSupporterCookie(name){
    document.cookie = name + "=; expires=Mon, 01 Jan 2018 00:00:00 GMT /;";
}

/**
 * Remove alias
 */
function deleteCookie(name){
    removeCookie(name);
}

/**
 * Provide .reverse() for usage in scripts
 */
jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse());
};