/*
 * Matt Sohinki Live Stream Overlays
 * --
 * Author: Stephen Falepau
 * File created: 1/10/2018, 9:53pm
 */

// Global-accessible data array variables
var appData = {};
var overlayAliasData = [];
var overlayThemesData = [];
var overlayNoticesData = [];
var overlayGamesData = [];
var overlaySocialsData = [];
var overlaySocialPresetData = [];
var activeTheme = {};
var fallbackTheme = {};
var gamePlatformData = {};
var supporterOverlay = {};

// Global-accessible default variables
var theme = "";
var noticeDuration = 60;
var noticeDelay = 10;

// File name variable
var currentLocation = document.location.href;
var filename = currentLocation.substr(currentLocation.lastIndexOf('/') + 1).replace(".html", "");

$(function(){
    /**
     * Get relevant cookies from browser for app and set them as global variables
     */
    var cookie_theme = getCookie("overlay_theme_" + filename);
    var cookie_gamename = getCookie("overlay_gamename_" + filename);
    var cookie_social = getCookie("overlay_socialpreset_" + filename);
    var cookie_placement = getCookie("overlay_placement_" + filename);
    var cookie_notice = getCookie("overlay_notice_" + filename);
    var cookie_duration = getCookie("overlay_duration_" + filename);
    var cookie_delay = getCookie("overlay_delay_" + filename);
    var cookie_platform = getCookie("overlay_platform_" + filename);
    
    var supporters_current = getCookie("supporters_overlay_current");
    var supporters_total = getCookie("supporters_overlay_total");
    var supporters_position = getCookie("supporters_overlay_position");
    var supporters_state = getCookie("supporters_overlay_state");
    
    var shell_loc = "/app/layouts/overlay/global.html";
    if(filename === "full") shell_loc = "/app/layouts/overlay/full.html";
    
    $.ajax({
        url: shell_loc,
        async: false,
        dataType: "html",
        success: function(data){
            $("#container").append(data);
            getAppData();
        }
    });
    
    function getAppData(){
        
        // Get overlay data and set appData array
        $.ajax({
            url: "/app/data/overlay.json",
            async: false,
            dataType: "json",
            contentType: "application/json",
            success: function(data){
                appData = data;
            }
        });
        
        // Get settings holder and append to app
        $.ajax({
            url: "/app/layouts/settings-modal/overlay.html",
            async: false,
            dataType: "html",
            success: function(data){
                $("div#settings-modal").append(data);
            }
        });
        
        overlayAliasData = appData.aliases;
        overlayThemesData = appData.theme;
        overlayNoticesData = appData.notices;
        overlaySocialsData = appData.social;
        overlaySocialPresetData = appData.social_presets;
        gamePlatformData = appData.platform;
        
        setOverlayTheme();
    }
    
    /**
     * Set the theme first, in a cancel-out-step by step method
     */
    function setOverlayTheme(defaultTheme = false){
        
        // create variable used for filtering purposes in later stage
        var originalTheme = "";
        var nextStep = true;
        
        // set by html attribute
        originalTheme = $("html").attr("data-theme");
        
        // override-set by cookie if exists
        if(cookie_theme) originalTheme = cookie_theme;
        
        // check if originalTheme exists first in the main themes list
        $.each(overlayThemesData, function(i, themeItem){
            if(themeItem.id === originalTheme){
                theme = themeItem.id;
                nextStep = false; // stop from checking alias data
            }
        });
        
        // theme doesn't exist in list, check if it exists in the alias data
        if(nextStep){
            // we need to see if the originalTheme is the original theme or an alias
            $.each(overlayAliasData, function(i, aliasTheme){
                if(aliasTheme.id === originalTheme) theme = aliasTheme.original;
            });
            
            // if we still have no match, fallback to default
            if(theme === "") setOverlayTheme(true);
        }
        
        // falback plan - use default
        if(defaultTheme) theme = "default";
        
        if(cookie_duration){
            activeTheme["duration"] = cookie_duration;
        } else {
            activeTheme["duration"] = noticeDuration;
        }
        
        if(cookie_delay){
            activeTheme["delay"] = cookie_delay;
        } else {
            activeTheme["delay"] = noticeDelay;
        }
        
        if(cookie_social){
            activeTheme["social_preset"] = cookie_social;
        } else {
            activeTheme["social_preset"] = "default";
        }
        
        activeTheme["file_name"] = filename;
        activeTheme["theme"] = theme;
        
        // Set up more active theme object keys
        themeSetup();
    }
    
    function getPlatformName(platformId = 0){
        var platformTitle = "";
        
        $.each(gamePlatformData, function(i, platformObj){
            if(i === platformId) platformTitle = platformObj.title;
        });
        
        return platformTitle;
    }
    
    function themeSetup(){
        var nextStep_gamename = true;
        var nextStep_placement = true;
        var nextStep_social = true;
        var nextStep_platform = true;
        
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
        
        if(supporters_position){
            supporterOverlay["position"] = supporters_position;
        } else {
            supporterOverlay["position"] = "bottom-left";
        }
        
        if(supporters_state){
            supporterOverlay["show"] = supporters_state;
        } else {
            supporterOverlay["show"] = "true";
        }
        
        if(cookie_notice) activeTheme["notice"] = cookie_notice;
        
        $.each(overlayThemesData, function(i, themeItem){
            if(themeItem.id === theme){
                activeTheme["game_name"] = themeItem.title;   
                activeTheme["platform_id"] = themeItem.platform;
                activeTheme["placement"] = themeItem.placement;
                activeTheme["info_bar"] = themeItem.info_bar;
                activeTheme["info_bar_odd"] = themeItem.info_bar_odd;
                activeTheme["info_bar_even"] = themeItem.info_bar_even;
                nextStep_gamename = false;
                nextStep_placement = false;
                nextStep_platform = false;
            }
            
            if(themeItem.id === $('html').attr("data-theme")){
                fallbackTheme["theme"] = themeItem.id;
                fallbackTheme["game_name"] = themeItem.title;
                fallbackTheme["platform_id"] = themeItem.platform;
                fallbackTheme["placement"] = themeItem.placement;
                fallbackTheme["info_bar"] = themeItem.info_bar;
                fallbackTheme["info_bar_odd"] = themeItem.info_bar_odd;
                fallbackTheme["info_bar_even"] = themeItem.info_bar_even;
            }
        });
        
        if(cookie_gamename){
            activeTheme["game_name"] = cookie_gamename;
            nextStep_gamename = false;
        }
        
        if(nextStep_gamename) activeTheme["game_name"] = "Line One Example Text Copy";
        document.title = activeTheme["game_name"];
        
        if(cookie_platform){
            activeTheme["platform_id"] = parseInt(cookie_platform);
            nextStep_platform = false;
        }
        
        if(cookie_placement){
            activeTheme["placement"] = parseInt(cookie_placement);
            nextStep_placement = false;
        }
        
        if(nextStep_placement) activeTheme["placement"] = 0;
        if(nextStep_platform) activeTheme["platform_id"] = 0;

        activeTheme["platform"] = getPlatformName(activeTheme["platform_id"]);
        activeTheme["notice_override"] = false;
        
        // We only have one social group for the meantime
        $.each(overlaySocialsData, function(socialId, socialGroup){
            if(socialId === activeTheme["social_preset"]){
                var socialArray = [];
                
                $.each(socialGroup, function(i, socialItem){
                    socialArray.push({
                        "icon": socialItem.icon,
                        "display": socialItem.display
                    });
                });

                activeTheme["social"] = socialArray;
            }
        });
        
        $.each(activeTheme["social"], function(i, item){
            $("#info-bar-social").append('\n\
            <li>\n\
                <div class="info-bar-social-item">\n\
                    <div class="info-bar-social--icon"><i class="fab fa-'+item.icon+'"></i></div>\n\
                    <div class="info-bar-social--textcopy">'+item.display+'</div>\n\
                </div>\n\
            </li>');
        });
        
        // build theme profile
        $.each(overlayThemesData, function(i, themeItem){
            if(themeItem.id === "full") return;
            if(themeItem.id === activeTheme["theme"]){
                $("#settings-themes").append("<option value=\""+ themeItem.id+"\" selected=\"selected\">"+themeItem.title+"</option>");
            } else {
                $("#settings-themes").append("<option value=\""+ themeItem.id+"\">"+themeItem.title+"</option>");
            }
        });
        
        $.each(overlaySocialPresetData, function(i, presetItem){
            if(presetItem.id === activeTheme["social_preset"]){
                $("#settings-socialpreset").append("<option value=\""+ presetItem.id+"\" selected=\"selected\">"+presetItem.title+"</option>");
            } else {
                $("#settings-socialpreset").append("<option value=\""+ presetItem.id+"\">"+presetItem.title+"</option>");
            }
        });
        
        $.each(gamePlatformData, function(i, platformItem){
            if(i === activeTheme["platform_id"]){
                if(i !== 0) $("#settings-platform").append("<option value=\""+ i +"\" selected=\"selected\">"+platformItem.title+"</option>");
            } else {
                if(i !== 0) $("#settings-platform").append("<option value=\""+ i +"\">"+platformItem.title+"</option>");
            }
        });
        
        $.each(overlayNoticesData, function(i, noticeItem){
            if(noticeItem.id === "full") return;
            if(noticeItem.id === activeTheme["notice"]){
                activeTheme["notice_url"] = noticeItem.url;
                if(noticeItem.override) activeTheme["notice_override"] = noticeItem.override;
                $("#settings-notices").append("<option value=\""+ noticeItem.id+"\" data-override=\""+ noticeItem.override +"\" selected=\"selected\">"+noticeItem.title+"</option>");
            } else {
                if(noticeItem.override) activeTheme["notice_override"] = noticeItem.override;
                $("#settings-notices").append("<option value=\""+ noticeItem.id+"\" data-override=\""+ noticeItem.override +"\">"+noticeItem.title+"</option>");
            }
        });
        
        $("#info-bar-social li:odd").addClass("odd");
        $("#info-bar-social li:even").addClass("even");
        
        // we have the variables set, now it's time to theme up the overlay
        themeification();
    }
    
    function themeification(){
        // Info Bar
        $("#info-bar").css("background", activeTheme["info_bar"]);
        $("#info-bar").attr("data-placement", activeTheme["placement"]);
    
        $("#supporter-counter-container").addClass(supporterOverlay["position"]);
        $("#supporter-counter").css("background-image", "linear-gradient(to top left, black, "+ activeTheme["info_bar_odd"] +")");
        $("[data-current-counter]").text(supporterOverlay["current"]);
        $("[data-total-counter]").text(supporterOverlay["goal"]);
        
        // Info Bar Left
        if(activeTheme["platform_id"] !== 0){
            $("#info-bar-current-game").text(activeTheme["game_name"] +" ("+ activeTheme["platform"] +")");
        } else {
            $("#info-bar-current-game").text(activeTheme["game_name"]);
        }
        
        if($("#info-bar-current-game").text().length >= 36) $("#info-bar-current-game").css("font-size", "32px");
    
        $("#info-bar-social li.even").css("background", activeTheme["info_bar_even"]);
        $("#info-bar-social li.odd").css("background", activeTheme["info_bar_odd"]);
        
        if(activeTheme["notice_url"]){
            $.get({
                url: activeTheme["notice_url"],
                success: function(rep){
                    $("#notice-block").append(rep);
                    
                    setTimeout(function(){
                        $("#notice-block").addClass("active");
                    }, 1000);
                }
            });
        }
        
        // now that everything is themed, start the animation!
        startAnimation();
    }
    
    function startAnimation(){
        setTimeout(function(){
            if($("#info-bar").attr("data-placement") == 1){
                $("#info-bar").addClass("show-from-bottom");
                $("#info-bar-left-light").addClass("show-from-bottom");
                $("#notice-block").addClass("bottom");
            } else {
                $("#info-bar").addClass("show-from-top");
                $("#info-bar-left-light").addClass("show-from-top");           
                $("#notice-block").addClass("top");
            }
            
            var $sc_container = $("#supporter-counter-container");
            
            if($("#info-bar").attr("data-placement") == 1){
                if($sc_container.hasClass("bottom-left") || $sc_container.hasClass("bottom-right")) $sc_container.addClass("infobar-bottom");
            } else {
                if($sc_container.hasClass("top-left") || $sc_container.hasClass("top-right")) $sc_container.addClass("infobar-top");
            }
            
            setTimeout(function(){
                $("#info-bar-left").addClass("active");
                $("#info-bar-right").addClass("active");
                if(supporterOverlay["show"] === "true"){
                    $("#supporter-counter-back").addClass("active"); 

                    setTimeout(function(){
                        $("#supporter-counter").addClass("active");            
                        updateSupporterProgressBar();
                    }, 500);     
                }
            }, 1*1000);
            
            setTimeout(function(){
                // remove the queued class from info bar light
                $("#info-bar-left-light").removeClass("queued");
            }, 1.59*1000);
        }, 0.1 * 1000);
    }
    
    function endAnimation(){
        $("#info-bar-left-light").addClass("queued");

        if(supporterOverlay["show"] === "true"){
            $("#supporter-counter").removeClass("active"); 

            setTimeout(function(){
                $("#supporter-counter-back").removeClass("active");  
            }, 500);     
        }
        
        setTimeout(function(){
            $("#info-bar-left").removeClass("active");
            $("#info-bar-right").removeClass("active");
            $("#notice-block").removeClass("active");

            if($("#gameplay-fullcam-border").length){
                $("#gameplay-fullcam-border .line").reverse().each(function(i){
                    $(this).delay(290*i).queue(function(nextBorder){
                        $(this).addClass("queued").dequeue();
                    })
                });
            }

            setTimeout(function(){
                if($("#info-bar").hasClass("show-from-top")) $("#info-bar").removeClass("show-from-top");
                if($("#info-bar").hasClass("show-from-bottom")) $("#info-bar").removeClass("show-from-bottom");
                
                setTimeout(function(){
                    window.location.reload();
                }, 1*1000);
            }, 0.5*1000);
            
        }, 1*1000);
    }
    
    supporterGoalInterval = setInterval(function(){
        checkForSupporterUpdates();
    }, 15 * 1000);
    
    function checkForSupporterUpdates(){
        var changesDetected = false;
        var cachedCurrent = supporterOverlay["current"];
        var cachedGoal = supporterOverlay["goal"];
        var cachedPosition = supporterOverlay["position"];
        var cachedState = supporterOverlay["show"];
        
        if(getCookie("supporters_overlay_current") !== cachedCurrent) changesDetected = true;
        if(getCookie("supporters_overlay_total") !== cachedGoal) changesDetected = true;
        if(getCookie("supporters_overlay_position") !== cachedPosition) changesDetected = true;
        if(getCookie("supporters_overlay_state") !== cachedState) changesDetected = true;
        
        if(changesDetected){
            supporterOverlay["current"] = getCookie("supporters_overlay_current");
            supporterOverlay["goal"] = getCookie("supporters_overlay_total");
            supporterOverlay["position"] = getCookie("supporters_overlay_position");
            supporterOverlay["show"] = getCookie("supporters_overlay_state");
            restartSupporterGoal();
        }
    }
    
    // remove from screen and restart animation
    function restartSupporterGoal(){
        var $sc_container = $("#supporter-counter-container");
        
        if(supporterOverlay["show"] === "true"){
            setTimeout(function(){
                if($("#supporter-counter").hasClass("active")) $("#supporter-counter").removeClass("active");
            
                setTimeout(function(){
                    $("#supporter-counter-container").removeAttr("class");
                    $("#supporter-counter-container").addClass(supporterOverlay["position"]);
                    
                    if($("#info-bar").attr("data-placement") == 1){
                        if($sc_container.hasClass("infobar-top")) $sc_container.removeClass("infobar-top");
                        if($sc_container.hasClass("bottom-left") || $sc_container.hasClass("bottom-right")) $sc_container.addClass("infobar-bottom");
                    } else {
                        if($sc_container.hasClass(".infobar-bottom")) $sc_container.removeClass("infobar-bottom");
                        if($sc_container.hasClass("top-left") || $sc_container.hasClass("top-right")) $sc_container.addClass("infobar-top");
                    }
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
    
    $("#settings-trigger").click(function(){
        toggleSettings();
        settingsPopup();
    });
    
    $("#settings-save").click(function(){
        applyChangesRestart(true);
    });
    
    $("#settings-refresh").click(function(){
        applyChangesRestart();
    });
    
    $("#settings-reset").click(function(){
        toggleResetConfirm();
    });
    
    $("#settings-reset-confirmed").click(function(){
        resetCookies();
        applyChangesRestart();
    });
    
    $("#settings-reset-backout").click(function(){
        toggleResetConfirm();
    });
    
    $(".settings-modal-close").click(function(){ 
        toggleSettings();
        
        // set everything back to as they were
        $("#settings-theme").val(activeTheme["theme"]);
        updateInfoBarColourPreview(activeTheme["theme"]);
        $("#settings-game").val(activeTheme["game_name"]);
        $("#settings-socialpreset").val(activeTheme["social_preset"]);
        $("#settings-placement").val(activeTheme["placement"]);
        $("#settings-platform").val(activeTheme["platform_id"]);
        $("#settings-notices").val(activeTheme["notice"]);
        $("#settings-duration").val(activeTheme["duration"]);
        $("#settings-delay").val(activeTheme["delay"]);
    });
    
    $("#settings-themes").change(function(){
        updateInfoBarColourPreview($(this).val());
    });
    
    $("#settings-notices").change(function(){  
        updateNoticeSection($(this).val());
    });
    
    function updateNoticeSection(chosenOne){
        // change availablility of fields
        $.each(overlayNoticesData, function(i, noticeItem){
            if(noticeItem.id === chosenOne){
                if(noticeItem.override === true){
                    $("#settings-duration").attr("disabled", "");
                    $("#settings-delay").attr("disabled", "");
                    $('.alert-block[data-field-id="notices"]').addClass("active info");
                    $("#notice-form").addClass("hide");
                } else {
                    $("#settings-duration").removeAttr("disabled");
                    $("#settings-delay").removeAttr("disabled");
                    $('.alert-block[data-field-id="notices"]').removeClass("active");
                    $("#notice-form").removeClass("hide");
                }
            }
        });
    }
    
    function updateSupporterProgressBar(){
        // set to zero
        $("#supporter-counter-progress-bar").css("width", "0%");
        
        setTimeout(function(){
            var supporterPercentage = (supporterOverlay["current"] / supporterOverlay["goal"] * 100);
            $("#supporter-counter-progress-bar").css("width", supporterPercentage + "%");
        }, 1500);
    }
    
    function toggleResetConfirm(){
        $("#settings-content").toggleClass("hide");
        $("#settings-reset-content").toggleClass("hide");
        
        $("[data-file-name]").text(filename);
    }
    
    function toggleSettings(){
        $("#settings").toggleClass("active");
        $("#settings-modal").toggleClass("active");
    }
    
    /**
     * All the things to do with Overlay Settings
     */
    function settingsPopup(){
        $("#target").text(filename);
        
        updateInfoBarColourPreview(activeTheme["theme"]);
        $("#settings-game").val(activeTheme["game_name"]);
        $("#settings-socialpreset").val(activeTheme["social_preset"]);
        $("#settings-placement").val(activeTheme["placement"]);
        $("#settings-platform").val(activeTheme["platform_id"]);
        $("#settings-notices").val(activeTheme["notice"]);
        $("#settings-duration").val(activeTheme["duration"]);
        $("#settings-delay").val(activeTheme["delay"]);
        
        updateNoticeSection(activeTheme["notice"]);
        
        if(activeTheme["notice_override"]){
            $("#settings-duration").attr("disabled", "");
            $("#settings-delay").attr("disabled", "");
        }
        
        // save this til last in the the load up
        $("select").customSelect();
    }
    
    function applyChangesRestart(writeCookies = false){
        var filteredPlacement = 0;
        var filteredPlatform = 0;
        var filteredSocialPreset = "default";
        var filteredTheme = "default";
        
        if(writeCookies){
            
            if($("#settings-placement").val() !== null){
                filteredPlacement = $("#settings-placement").val();
            } else {
                filteredPlacement = activeTheme["placement"];
            }
            
            if($("#settings-platform").val() !== null){
                filteredPlatform = $("#settings-platform").val();
            } else {
                filteredPlatform = activeTheme["platform_id"];
            }
            
            if($("#settings-themes").val() !== null){
                filteredTheme = $("#settings-themes").val();
            } else {
                filteredTheme = activeTheme["theme"];
            }
            
            if($("#settings-socialpreset").val() !== null) filteredSocialPreset = $("#settings-socialpreset").val();
            
            resetCookies();
            
            setCookie("overlay_theme_"+ filename, filteredTheme);
            setCookie("overlay_gamename_"+ filename, $("#settings-game").val());
            setCookie("overlay_socialpreset_"+ filename, $("#settings-socialpreset").val());
            setCookie("overlay_placement_"+ filename, filteredPlacement);
            setCookie("overlay_platform_"+ filename, filteredPlatform);
            setCookie("overlay_notice_"+ filename, $("#settings-notices").val());
            setCookie("overlay_duration_"+ filename, $("#settings-duration").val());
            setCookie("overlay_delay_"+ filename, $("#settings-delay").val());
        }
        
        toggleSettings();
        endAnimation();
    }
    
    function resetCookies(){
        removeCookie("overlay_theme_"+ filename);
        removeCookie("overlay_gamename_"+ filename);
        removeCookie("overlay_socialpreset_"+ filename);
        removeCookie("overlay_placement_"+ filename);
        removeCookie("overlay_platform_"+ filename);
        removeCookie("overlay_notice_"+ filename);
        removeCookie("overlay_duration_"+ filename);
        removeCookie("overlay_delay_"+ filename);
    }
    
    function updateInfoBarColourPreview(themePreview){
        var item_odd = "#499999";
        var item_even = "#2c7f7f";
        var item_infobar = "#006566";
        var gameTitlePreview, platformPreview;
        
        $.each(overlayThemesData, function(i, themeItem){
            if(themeItem.id === themePreview){
                // override any values
                gameTitlePreview = themeItem.title;
                platformPreview = themeItem.platform_id;
                if(themeItem.info_bar_odd) item_odd = themeItem.info_bar_odd;
                if(themeItem.info_bar_even) item_even = themeItem.info_bar_even;
                if(themeItem.info_bar) item_infobar = themeItem.info_bar;
            }
        });
        
        $("#settings-colour-bar-1").css("background", item_infobar);
        $("#settings-colour-bar-2").css("background", item_odd);
        $("#settings-colour-bar-3").css("background", item_even);
        $("#settings-game").val(gameTitlePreview);
        $("#settings-platform").val(platformPreview);
    }
    
});

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

/**
 * Remove cookies from browser by making it expire
 */
function removeCookie(name){
    document.cookie = name + "=; expires=Mon, 01 Jan 2018 00:00:00 GMT;";
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

function _extends(){return(_extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key])}return target}).apply(this,arguments)}var CustomSelect=function($){var defaults={block:"custom-select",hideCallback:!1,includeValue:!1,keyboard:!0,modifier:!1,placeholder:!1,search:!1,showCallback:!1,transition:0},CustomSelect=function(){function CustomSelect(select,options){this._$select=$(select),this._options=_extends({},defaults,"object"==typeof options?options:{}),this._activeModifier=this._options.block+"--active",this._dropupModifier=this._options.block+"--dropup",this._optionSelectedModifier=this._options.block+"__option--selected",this._keydown=this._keydown.bind(this),this._dropup=this._dropup.bind(this),this._outside=this._outside.bind(this),this._init()}var _proto=CustomSelect.prototype;return _proto.reset=function(){this._$dropdown.hide().empty(),this._$value.off("click"),this._fill()},_proto._init=function(){this._$element=$('<div class="'+this._options.block+'">\n           <button class="'+this._options.block+"__option "+this._options.block+'__option--value" type="button"></button>\n           <div class="'+this._options.block+'__dropdown" style="display: none;"></div>\n         </div>'),this._$select.hide().after(this._$element),this._options.modifier&&this._$element.addClass(this._options.modifier),this._$value=this._$element.find("."+this._options.block+"__option--value"),this._$dropdown=this._$element.find("."+this._options.block+"__dropdown"),this._fill()},_proto._fill=function(){var _this=this;this._$values=this._$select.find("option"),this._values=[];var placeholder=this._options.placeholder;$.each(this._$values,function(i,option){var el=$(option).text().trim();_this._values.push(el)}),placeholder&&(this._$select.find("[selected]").length?placeholder=!1:(this._$value.html(placeholder),this._$select.prop("selectedIndex",-1))),$.each(this._values,function(i,el){var cssClass=_this._$values.eq(i).attr("class"),$option=$('<button class="'+_this._options.block+'__option" type="button">'+el+"</button>"),$selected=_this._$select.find(":selected");_this._$values.eq(i).attr("disabled")&&$option.prop("disabled",!0),!$selected.length&&0===i||el===$selected.text().trim()?(placeholder||_this._$value.text(el).removeClass(_this._$value.data("class")).removeData("class").addClass(cssClass).data("class",cssClass),(_this._options.includeValue||placeholder)&&($option.addClass(cssClass),$option.toggleClass(_this._optionSelectedModifier,_this._$values.eq(i).is("[selected]")),_this._$dropdown.append($option))):($option.addClass(cssClass),_this._$dropdown.append($option))}),this._$options=this._$dropdown.find("."+this._options.block+"__option"),this._options.search&&this._search(),this._$value.one("click",function(event){_this._show(event)}),this._$options.length||this._$value.prop("disabled",!0),this._$options.on("click",function(event){_this._select(event)})},_proto._show=function(event){var _this2=this;event.preventDefault(),this._dropup(),$(window).on("resize scroll",this._dropup),this._$element.addClass(this._activeModifier),this._$dropdown.slideDown(this._options.transition,function(){_this2._options.search&&(_this2._$input.focus(),_this2._options.includeValue&&_this2._scroll()),"function"==typeof _this2._options.showCallback&&_this2._options.showCallback.call(_this2._$element[0])}),setTimeout(function(){$(document).on("touchstart click",_this2._outside)},0),this._$value.one("click",function(event){event.preventDefault(),_this2._hide()}),this._options.keyboard&&(this._options.index=-1,$(window).on("keydown",this._keydown))},_proto._hide=function(){var _this3=this;this._options.search&&(this._$input.val("").blur(),this._$options.show(),this._$wrap.scrollTop(0)),this._$dropdown.slideUp(this._options.transition,function(){_this3._$element.removeClass(_this3._activeModifier).removeClass(_this3._dropupModifier),"function"==typeof _this3._options.hideCallback&&_this3._options.hideCallback.call(_this3._$element[0]),_this3._$value.off("click").one("click",function(event){_this3._show(event)}),$(document).off("touchstart click",_this3._outside),$(window).off("resize scroll",_this3._dropup)}),this._options.keyboard&&(this._$options.blur(),$(window).off("keydown",this._keydown))},_proto._scroll=function(){var _this4=this;$.each(this._$options,function(i,option){var $option=$(option);if($option.text()===_this4._$value.text()){var top=$option.position().top,center=_this4._$wrap.outerHeight()/2-$option.outerHeight()/2;return center<top&&_this4._$wrap.scrollTop(top-center),!1}})},_proto._select=function(event){var _this5=this;event.preventDefault();var choice=$(event.currentTarget).text().trim(),values=this._values.concat();if(this._$value.text(choice).removeClass(this._$value.data("class")),this._$values.prop("selected",!1),$.each(values,function(i,el){_this5._options.includeValue||el!==choice||values.splice(i,1),$.each(_this5._$values,function(i,option){var $option=$(option);if($option.text().trim()===choice){var cssClass=$option.attr("class");$option.prop("selected",!0),_this5._$value.addClass(cssClass).data("class",cssClass)}})}),this._hide(),this._options.includeValue)this._$options.removeClass(this._optionSelectedModifier),$.each(this._$options,function(i,option){var $option=$(option);if($option.text().trim()===choice)return $option.addClass(_this5._optionSelectedModifier),!1});else{if(this._$options.length>values.length){var last=this._$options.eq(values.length);last.remove(),this._$options=this._$options.not(last),this._$options.length||this._$value.prop("disabled",!0)}$.each(this._$options,function(i,option){var $option=$(option);$option.text(values[i]),$option.attr("class",_this5._options.block+"__option"),$.each(_this5._$values,function(){var $this=$(this);$this.text().trim()===values[i]&&$option.addClass($this.attr("class"))})})}void 0!==event.originalEvent&&this._$select.trigger("change")},_proto._search=function(){var _this6=this;this._$input=$('<input class="'+this._options.block+'__input" autocomplete="off">'),this._$dropdown.prepend(this._$input),this._$options.wrapAll('<div class="'+this._options.block+'__option-wrap"></div>'),this._$wrap=this._$element.find("."+this._options.block+"__option-wrap"),this._$input.on("focus",function(){_this6._options.index=-1}),this._$input.on("keyup",function(){var query=_this6._$input.val().trim();query.length?(_this6._$wrap.scrollTop(0),setTimeout(function(){query===_this6._$input.val().trim()&&$.each(_this6._$options,function(i,option){var $option=$(option),match=-1!==$option.text().trim().toLowerCase().indexOf(query.toLowerCase());$option.toggle(match)})},300)):_this6._$options.show()})},_proto._dropup=function(){var bottom=this._$element[0].getBoundingClientRect().bottom,up=$(window).height()-bottom<this._$dropdown.height();this._$element.toggleClass(this._dropupModifier,up)},_proto._outside=function(event){var $target=$(event.target);$target.parents().is(this._$element)||$target.is(this._$element)||this._hide()},_proto._keydown=function(event){var $visible=this._$options.filter(":visible").not("[disabled]");switch(event.keyCode){case 40:event.preventDefault(),$visible.eq(this._options.index+1).length?this._options.index+=1:this._options.index=0,$visible.eq(this._options.index).focus();break;case 38:event.preventDefault(),$visible.eq(this._options.index-1).length&&0<=this._options.index-1?this._options.index-=1:this._options.index=$visible.length-1,$visible.eq(this._options.index).focus();break;case 13:case 32:if(!this._$input||!this._$input.is(":focus")){event.preventDefault();var $option=this._$options.add(this._$value).filter(":focus");$option.trigger("click"),$option.is(this._$value)||this._$select.trigger("change"),this._$value.focus()}break;case 27:event.preventDefault(),this._hide(),this._$value.focus()}},CustomSelect._jQueryPlugin=function(config){return this.each(function(){var $this=$(this),data=$this.data("custom-select");data?"reset"===config&&data.reset():"string"!=typeof config&&(data=new CustomSelect(this,config),$this.data("custom-select",data))})},CustomSelect}();return $.fn.customSelect=CustomSelect._jQueryPlugin,$.fn.customSelect.noConflict=function(){return $.fn.customSelect},CustomSelect}($);
