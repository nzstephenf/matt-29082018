/*
 * Matt Sohinki Live Stream Intermission Screens
 * --
 * Author: Stephen Falepau
 * File created: 4/11/2018, 12:37am
 */

// 1: Global Reusable Variables, Objects and Arrays
var screenData, supportersOverlay = {}, activeScreen = {}, countdown = {}, brb_screen, startingsoon_screen, streamending_screen;
var storedSupportersOverlayData = localStorage.getItem("supporters-overlay"), storedCountdownData = localStorage.getItem("countdown"),
    storedBrbScreenData = localStorage.getItem("brb-screen"), storedStartingSoonScreenData = localStorage.getItem("starting-soon-screen"), storedStreamEndingScreenData = localStorage.getItem("stream-ending-screen");

storedSupportersOverlayData = (storedSupportersOverlayData) ? JSON.parse(storedSupportersOverlayData) : {}, storedCountdownData = (storedCountdownData) ? JSON.parse(storedCountdownData) : {},
storedBrbScreenData = (storedBrbScreenData) ? JSON.parse(storedBrbScreenData) : {}, storedStartingSoonScreenData = (storedStartingSoonScreenData) ? JSON.parse(storedStartingSoonScreenData) : {}, storedStreamEndingScreenData = (storedStreamEndingScreenData) ? JSON.parse(storedStreamEndingScreenData) : {};
supportersOverlay = storedSupportersOverlayData, countdown = storedCountdownData, brb_screen = storedBrbScreenData, startingsoon_screen = storedStartingSoonScreenData, streamending_screen = storedStreamEndingScreenData;

$(function(){
    IntermissionInit();
    
    IntermissionUpdateInterval = setInterval(function(){
        CheckForSupporterGoalUpdates();
        CheckForCountdownUpdates();
        CheckForIntermissionScreenUpdates();
    }, 5 * 1000);
    
    function IntermissionInit(){
       $.ajax({
            url: "/app/data/screens.json",
            async: false,
            dataType: "json",
            success: function(data){
                $.each(data.screen, function(i, screenItem){
                    if(screenItem.id === $("html").attr("data-screen")) activeScreen = screenItem;
                });
                
                $.each(data.social, function(ItemId, socialItem){
                    if(ItemId === activeScreen["social_preset"]) activeScreen["social"] = socialItem;
                });
                
                screenData = data;
            }
        });
    
        // Get shell
        $.ajax({
            url: "/app/layouts/intermission-screen/global-alternative.html",
            async: false,
            dataType: "html",
            success: function(data){
                $("div#container").append(data);
                SetupScreen();
            }
        });
    }
    
    function CheckForSupporterGoalUpdates(){
        storedSupportersOverlayData = JSON.parse(localStorage.getItem("supporters-overlay"));
        var changesDetected = false, cachedTimestamp = supportersOverlay["timestamp"];
    
        if(storedSupportersOverlayData["timestamp"] !== cachedTimestamp) changesDetected = true;
        if(changesDetected) RestartSupporterGoal(storedSupportersOverlayData);
    }
    
    function RestartSupporterGoal(storedSupportersOverlayData = {}){
        supportersOverlay = storedSupportersOverlayData;
        var $supportercounter = $("#supporter-counter-container");
        
        if(supportersOverlay["state"] === true){
            setTimeout(function(){
                $("#supporter-counter-progress-bar").css("width", "0%");
                
                setTimeout(function(){
                    if($("#supporter-counter").hasClass("active")) $("#supporter-counter").removeClass("active");
            
                    setTimeout(function(){
                        $supportercounter.removeAttr("class");
                        $supportercounter.addClass(supportersOverlay["position"]);

                        if($("#info-bar").attr("data-placement") == 1){
                            if($supportercounter.hasClass("infobar-top")) $supportercounter.removeClass("infobar-top");
                            if($supportercounter.hasClass("bottom-left") || $supportercounter.hasClass("bottom-right")) $supportercounter.addClass("infobar-bottom");
                        } else {
                            if($supportercounter.hasClass(".infobar-bottom")) $supportercounter.removeClass("infobar-bottom");
                            if($supportercounter.hasClass("top-left") || $supportercounter.hasClass("top-right")) $supportercounter.addClass("infobar-top");
                        }
                    }, 1000);
                }, 500);
            }, 1000);
            
            setTimeout(function(){
                $("[data-current-counter]").text(supportersOverlay["current"]);
                $("[data-total-counter]").text(supportersOverlay["goal"]);

                setTimeout(function(){
                    $("#supporter-counter-back").addClass("active"); 
                    
                    setTimeout(function(){
                        $("#supporter-counter").addClass("active");            
                        UpdateSupporterGoalProgressBar();
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
    
    function UpdateSupporterGoalProgressBar(){
         // set to zero
        $("#supporter-counter-progress-bar").css("width", "0%");
        
        setTimeout(function(){
            var supporterPercentage = (supportersOverlay["current"] / supportersOverlay["goal"] * 100);
            $("#supporter-counter-progress-bar").css("width", supporterPercentage + "%");
        }, 1500);
    }
    
    function CheckForCountdownUpdates(){
        
    }
    
    function CheckForIntermissionScreenUpdates(){
        
    }
    
    function SetupScreen(){
        $("#supporter-counter-container").addClass(supportersOverlay["position"]);
        
        document.title = activeScreen["title"];
        $("#screen-title span").text(activeScreen["title"]);
        $("#screen-title span").css("color", activeScreen["colours"]["secondary"]);
        $("#screen-social-cta span").text(activeScreen["social_cta"]);
        $("#screen-social-cta span").css("color", activeScreen["colours"]["light"]);
        
        $("#screen-top-left").css("background", activeScreen["colours"]["dark"]);
        $("#screen-top-right").css("background", activeScreen["colours"]["dark"]);
        $("#supporter-counter").css("background", activeScreen["colours"]["dark"]);
        
        $("[data-current-counter]").text(supportersOverlay["current"]);
        $("[data-total-counter]").text(supportersOverlay["goal"]);
        UpdateSupporterGoalProgressBar();
        
        $.each(activeScreen["social"], function(i, socialObj){
            $("#screen-social ul").append(
                    "<li>\n\
                        <div class=\"top\"><i class=\"fab fa-"+socialObj.icon+"\"></i> "+socialObj.line_one+"</div>\n\
                        <div class=\"bottom\">"+socialObj.line_two+"</div>\n\
                    </li>");
        });
        $("#screen-social li .top").css("color", activeScreen["colours"]["light"]);
        
        $("#video-mask").css("background-image", "linear-gradient(-40deg, black, "+ activeScreen["colours"]["primary"] +")");
        $("#video-source").attr("src", activeScreen["video"]);
        
        if(supportersOverlay["state"] === true){
            $("#supporter-counter-back").addClass("active"); 

            setTimeout(function(){
                $("#supporter-counter").addClass("active");            
                UpdateSupporterGoalProgressBar();
            }, 500);     
        }
    }
    
});