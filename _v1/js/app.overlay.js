/*
 * Matt Sohinki Live Stream Overlays
 * --
 * Author: Stephen Falepau
 * File created: 1/10/2018, 9:53pm
 */

// 1: Global Reusable Variables, Objects and Arrays
var theme, appData = {}, overlayAliasData = [], overlayThemesData = [], overlaySocialPresetData = [], activeNoticeData,
    overlaySocialsData = [], activeOverlay = {}, activeNotice = {}, fallbackOverlay = {}, supportersOverlay = {}, gamePlatformData = {}, initialTheme = "",
    currentLocation = document.location.href, filename = currentLocation.substr(currentLocation.lastIndexOf('/') + 1).replace(".html", "");

var storedOverlayData = localStorage.getItem("overlay-"+ filename), storedSupportersOverlayData = localStorage.getItem("supporters-overlay"), activeNoticeData = localStorage.getItem("notice-cta");
storedOverlayData = (storedOverlayData) ? JSON.parse(storedOverlayData) : {}, storedSupportersOverlayData = (storedSupportersOverlayData) ? JSON.parse(storedSupportersOverlayData) : {},
activeNotice = (activeNoticeData) ? JSON.parse(activeNoticeData) : {}, supportersOverlay = storedSupportersOverlayData;

$(function(){
    OverlayInit();
    
    OverlayUpdateInterval = setInterval(function(){
        CheckForSupporterGoalUpdates();
        CheckForNoticesUpdates();
    }, 5 * 1000);
    
    function OverlayInit(){
        var shell_loc = "/app/layouts/overlay/global.html";
        if(filename === "full") shell_loc = "/app/layouts/overlay/full.html";
    
        $.ajax({
            url: shell_loc,
            async: false,
            dataType: "html",
            success: function(html){
                $("#container").append(html);
                GetAppData();
            }
        });
    }
    
    function GetAppData(){
        $.ajax({
            url: "/app/data/overlay.json",
            async: false,
            dataType: "json",
            contentType: "application/json",
            success: function(data){
                appData = data;
            }
        });
        
        $.ajax({
            url: "/app/layouts/settings-modal/overlay.html",
            async: false,
            dataType: "html",
            success: function(html){
                $("div#settings-modal").append(html);
            }
        });
        
        if(activeNotice["notice"] !== null){
            $.get({
                url: activeNotice["notice_url"],
                success: function(rep){
                    $("#notice-block").append(rep);
                    
                    setTimeout(function(){
                        $("#notice-block").addClass("active");
                    }, 1000);
                }
            });
        }
        
        overlayAliasData = appData.aliases;
        overlayThemesData = appData.theme;
        overlaySocialsData = appData.social;
        overlaySocialPresetData = appData.social_presets;
        gamePlatformData = appData.platform;
        
        SetOverlayTheme();
    }
    
    function SetOverlayTheme(){
        var originalTheme = "", nextStep = true;
        
        originalTheme = $("html").attr("data-theme");
        if(storedOverlayData["theme"]) originalTheme = storedOverlayData["theme"];
        
        $.each(overlayThemesData, function(i, themeItem){
            if(themeItem.id === originalTheme){
                theme = themeItem.id;
                nextStep = false;
            }
        });
        
        if(nextStep){
            $.each(overlayAliasData, function(i, aliasItem){
                if(aliasItem.id === originalTheme) theme = aliasItem.original;
            });
            
            if(!theme) theme = "default";
        }
        
        if(storedOverlayData["social_preset"]) activeOverlay["social_preset"] = storedOverlayData["social_preset"];
        if(storedOverlayData["platform"]) activeOverlay["platform_id"] = storedOverlayData["platform"];
        activeOverlay["file_name"] = filename;
        activeOverlay["theme"] = theme;
        
        ThemeSetup();
    }
    
    function ThemeSetup(){
        var nextStep_gamename = true, nextStep_placement = true,
            nextStep_social = true, nextStep_platform = true;
        
        // Set defaults up if specific stored data doesn't exist
        if(!storedSupportersOverlayData["current"]) supportersOverlay["current"] = 0;
        if(!storedSupportersOverlayData["goal"]) supportersOverlay["goal"] = 100;
        if(!storedSupportersOverlayData["position"]) supportersOverlay["position"] = "bottom-left";
        if(!storedSupportersOverlayData["state"]) supportersOverlay["state"] = true;
        
        $.each(overlayThemesData, function(i, themeItem){
            if(themeItem.id === theme){
                activeOverlay["game_name"] = themeItem.title;
                activeOverlay["platform_id"] = themeItem.platform;
                activeOverlay["placement"] = themeItem.placement;
                activeOverlay["info_bar"] = themeItem.info_bar;
                activeOverlay["info_bar_odd"] = themeItem.info_bar_odd;
                activeOverlay["info_bar_even"] = themeItem.info_bar_even;
                
                nextStep_gamename = false;
                nextStep_placement = false;
                nextStep_platform = false;
            }
            
            if(themeItem.id === $("html").attr("data-theme")){
                fallbackOverlay["game_name"] = themeItem.title;
                fallbackOverlay["platform_id"] = themeItem.platform;
                fallbackOverlay["placement"] = themeItem.placement;
                fallbackOverlay["info_bar"] = themeItem.info_bar;
                fallbackOverlay["info_bar_odd"] = themeItem.info_bar_odd;
                fallbackOverlay["info_bar_even"] = themeItem.info_bar_even;
                
                nextStep_gamename = false;
                nextStep_placement = false;
                nextStep_platform = false;
            }
        });
        
        if(activeOverlay["theme"] === "default") activeOverlay["game_name"] = "Line One Example Text Copy";
        
        if(storedOverlayData["game_name"]){
            activeOverlay["game_name"] = storedOverlayData["game_name"];
            nextStep_gamename = false;
        }
        
        if(nextStep_gamename) activeOverlay["game_name"] = "Line One Example Text Copy";
        document.title = activeOverlay["game_name"];
        
        if(storedOverlayData["platform"]){
            activeOverlay["platform_id"] = parseInt(storedOverlayData["platform"]);
            nextStep_platform = false;
        }
        
        if(storedOverlayData["placement"]){
            activeOverlay["placement"] = parseInt(storedOverlayData["placement"]);
            nextStep_placement = false;
        }
        
        if(nextStep_placement) activeOverlay["placement"] = 0;
        if(nextStep_platform) activeOverlay["platform_id"] = 0;
        
        activeOverlay["platform"] = GetPlatformName(activeOverlay["platform_id"]);
        
        if(!activeOverlay["platform_id"]) activeOverlay["platform_id"] = 0;
        if(!activeOverlay["social_preset"]) activeOverlay["social_preset"] = "default";
        
        
        $.each(overlaySocialsData, function(socialId, socialGroup){
            if(socialId === activeOverlay["social_preset"]){
                var socialArray = [];
                
                $.each(socialGroup, function(i, socialItem){
                    socialArray.push({
                        "icon": socialItem.icon,
                        "display": socialItem.display
                    });
                });

                activeOverlay["social"] = socialArray;
            }
        });
        
        $.each(activeOverlay["social"], function(i, item){
            $("#info-bar-social").append('\n\
            <li>\n\
                <div class="info-bar-social-item">\n\
                    <div class="info-bar-social--icon"><i class="fab fa-'+item.icon+'"></i></div>\n\
                    <div class="info-bar-social--textcopy">'+item.display+'</div>\n\
                </div>\n\
            </li>');
        });
        
        // Settings portion of theme setup
        $.each(overlayThemesData, function(i, themeItem){
            if(themeItem.id === "full") return;
            if(themeItem.id === activeOverlay["theme"]){
                $("#settings-form-themes").append("<option value=\""+ themeItem.id+"\" selected=\"selected\">"+themeItem.title+"</option>");
            } else {
                $("#settings-form-themes").append("<option value=\""+ themeItem.id+"\">"+themeItem.title+"</option>");
            }
        });
        
        $.each(overlaySocialPresetData, function(i, presetItem){
            if(presetItem.id === activeOverlay["social_preset"]){
                $("#settings-form-social-preset").append("<option value=\""+ presetItem.id+"\" selected=\"selected\">"+presetItem.title+"</option>");
            } else {
                $("#settings-form-social-preset").append("<option value=\""+ presetItem.id+"\">"+presetItem.title+"</option>");
            }
        });
        
        $.each(gamePlatformData, function(i, platformItem){
            if(i === activeOverlay["platform_id"]){
                $("#settings-form-platform").append("<option value=\""+ i +"\" selected=\"selected\">"+platformItem.title+"</option>");
            } else {
                if(i !== 0) $("#settings-form-platform").append("<option value=\""+ i +"\">"+platformItem.title+"</option>");
            }
        });
        
        $("#info-bar-social li:odd").addClass("odd");
        $("#info-bar-social li:even").addClass("even");
        
        Themeification();
    }
    
    function Themeification(){
        $("#info-bar").css("background", activeOverlay["info_bar"]);
        $("#info-bar").attr("data-placement", activeOverlay["placement"]);
        
        $("#stream-acknowledge-left-bg span").css("background", activeOverlay["info_bar_odd"]);
        $("#stream-acknowledge-right-bg span").css("background", activeOverlay["info_bar_even"]);
    
        $("#supporter-counter-container").addClass(supportersOverlay["position"]);
        $("#supporter-counter").css("background-image", "linear-gradient(to top left, black, "+ activeOverlay["info_bar_odd"] +")");
        $("[data-current-counter]").text(supportersOverlay["current"]);
        $("[data-total-counter]").text(supportersOverlay["goal"]);
        
        if(activeOverlay["platform_id"] !== 0){
            $("#info-bar-current-game").text(activeOverlay["game_name"]);
            $("#info-bar-current-platform").text("("+ activeOverlay["platform"] +")");
        } else {
            $("#info-bar-current-game").text(activeOverlay["game_name"]);
        }
        
        if($("#info-bar-current-game").text().length >= 36) $("#info-bar-current-game").css("font-size", "32px");
    
        $("#info-bar-social li.even").css("background", activeOverlay["info_bar_even"]);
        $("#info-bar-social li.odd").css("background", activeOverlay["info_bar_odd"]);
        
        StartAnimation();
    }
    
    function StartAnimation(){
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
                if(supportersOverlay["state"] === true){
                    $("#supporter-counter-back").addClass("active"); 

                    setTimeout(function(){
                        $("#supporter-counter").addClass("active");            
                        UpdateSupporterGoalProgressBar();
                    }, 500);     
                }
            }, 0.8*1000);
            
            setTimeout(function(){
                // remove the queued class from info bar light
                $("#info-bar-left-light").removeClass("queued");
                $("#stream-acknowledgements").addClass("active");
            }, 1.59*1000);
        }, 0.1 * 1000);
    }
    
    function EndAnimation(){
        $("#info-bar-left-light").addClass("queued");
        
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
        }
        
        setTimeout(function(){
            if(supportersOverlay["state"] === "true"){
                $("#supporter-counter").removeClass("active"); 

                setTimeout(function(){
                    $("#supporter-counter-back").removeClass("active");  
                }, 500);     
            }
            
            $("#info-bar-left").removeClass("active");
            $("#info-bar-right").removeClass("active");
            $("#notice-block").removeClass("active");

            /** if($("#gameplay-fullcam-border").length){
                $("#gameplay-fullcam-border .line").reverse().each(function(i){
                    $(this).delay(290*i).queue(function(nextBorder){
                        $(this).addClass("queued").dequeue();
                    })
                });
            } **/
                
            setTimeout(function(){
                if($("#info-bar").hasClass("show-from-top")) $("#info-bar").toggleClass("show-from-top from-top-end-animate");
                if($("#info-bar").hasClass("show-from-bottom")) $("#info-bar").toggleClass("show-from-bottom from-bottom-end-animate");

                setTimeout(function(){
                    window.location.reload();
                }, 1*1000);
            }, 0.5*1000);
            
        }, 1*1000);
    }
    
    function CheckForNoticesUpdates(){
        var storedNoticesData = JSON.parse(localStorage.getItem("notice-cta"));
        var changesDetected = false, cachedTimestamp = activeNotice["timestamp"];

        if(storedNoticesData["timestamp"] !== cachedTimestamp) changesDetected = true;
        
        if(changesDetected){
            activeNotice = storedNoticesData;
            $("#notice-block").removeClass("active");
            
            setTimeout(function(){
                $("#notice-block").html("");
                
                $.get({
                    url: activeNotice["notice_url"],
                    success: function(rep){
                        $("#notice-block").append(rep);

                        setTimeout(function(){
                            $("#notice-block").addClass("active");
                        }, 1000);
                    }
                });
            }, 1000);
            
            changesDetected = false;
        }
        
    }
    
    function CheckForSupporterGoalUpdates(){
        storedSupportersOverlayData = JSON.parse(localStorage.getItem("supporters-overlay"));

        var changesDetected = false, cachedCurrent = supportersOverlay["current"], cachedGoal = supportersOverlay["goal"],
            cachedPosition = supportersOverlay["position"], cachedState = supportersOverlay["state"];
    
        if(storedSupportersOverlayData["current"] !== cachedCurrent) changesDetected = true;
        if(storedSupportersOverlayData["goal"] !== cachedGoal) changesDetected = true;
        if(storedSupportersOverlayData["position"] !== cachedPosition) changesDetected = true;
        if(storedSupportersOverlayData["state"] !== cachedState) changesDetected = true;
        if(changesDetected) RestartSupporterGoal(storedSupportersOverlayData);
    }
    
    function RestartSupporterGoal(storedSupportersOverlayData = {}){
        supportersOverlay["current"] = storedSupportersOverlayData["current"];
        supportersOverlay["goal"] = storedSupportersOverlayData["goal"];
        supportersOverlay["position"] = storedSupportersOverlayData["position"];
        supportersOverlay["state"] = storedSupportersOverlayData["state"];
        
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
    
    function ToggleSettings(){
        $("#settings").toggleClass("active");
        $("#settings-modal").toggleClass("active");
        
        if($("#settings").hasClass("active")){
            if($("#settings-content").hasClass("hide")) $("#settings-content").removeClass("hide");
            if(!$("#settings-reset-content").hasClass("hide")) $("#settings-reset-content").addClass("hide");
        }
    }
    
    function ToggleResetConfirm(){
        $("#settings-content").toggleClass("hide");
        $("#settings-reset-content").toggleClass("hide");
        
        $("[data-file-name]").text(filename);
    }
    
    function ShowSettings(){
        $("#target").text(filename);
        UpdateInfobarPreview(activeOverlay["theme"]);
        $("#settings-form-gamename").val(activeOverlay["game_name"]);
        $("#settings-form-social-preset").val(activeOverlay["social_preset"]);
        $("#settings-form-placement").val(activeOverlay["placement"]);
        $("#settings-form-platform").val(activeOverlay["platform_id"]);
        $("select").customSelect();
    }
    
    function ApplySettingsChanges(alterStorage = false){
        var filteredPlacement, filteredPlatform,
            filteredSocialPreset, filteredTheme;

        if(alterStorage){
            if($("#settings-form-placement").val() !== null){
                filteredPlacement = $("#settings-form-placement").val();
            } else {
                filteredPlacement = activeOverlay["placement"];
            }
            
            if($("#settings-form-platform").val() !== null){
                filteredPlatform = $("#settings-form-platform").val();
            } else {
                filteredPlatform = activeOverlay["platform_id"];
            }
            
            if($("#settings-form-themes").val() !== null){
                filteredTheme = $("#settings-form-themes").val();
            } else {
                filteredTheme = activeOverlay["theme"];
            }
            
            if($("#settings-form-social-preset").val() !== null){
                filteredSocialPreset = $("#settings-form-social-preset").val();
            } else {
                filteredSocialPreset = activeOverlay["social_preset"];
            }
            
            var newStorageData = {
                "theme": filteredTheme,
                "game_name": $("#settings-form-game").val(),
                "social_preset": filteredSocialPreset,
                "placement": filteredPlacement,
                "platform": filteredPlatform
            };
            
            localStorage.setItem("overlay-"+ filename, JSON.stringify(newStorageData));
        }
        
        ToggleSettings();
        EndAnimation();
    }
    
    function UpdateInfobarPreview(themePreview = "default"){
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
        $("#settings-form-game").val(gameTitlePreview);
        $("#settings-form-platform").val(platformPreview);
    }
    
    function GetPlatformName(platformId = 0){
        var platformTitle = "";
        
        $.each(gamePlatformData, function(i, platformObj){
            if(i === platformId) platformTitle = platformObj.title;
        });
        
        return platformTitle;
    }
    
    function _extends(){return(_extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key])}return target}).apply(this,arguments)}var CustomSelect=function($){var defaults={block:"custom-select",hideCallback:!1,includeValue:!1,keyboard:!0,modifier:!1,placeholder:!1,search:!1,showCallback:!1,transition:0},CustomSelect=function(){function CustomSelect(select,options){this._$select=$(select),this._options=_extends({},defaults,"object"==typeof options?options:{}),this._activeModifier=this._options.block+"--active",this._dropupModifier=this._options.block+"--dropup",this._optionSelectedModifier=this._options.block+"__option--selected",this._keydown=this._keydown.bind(this),this._dropup=this._dropup.bind(this),this._outside=this._outside.bind(this),this._init()}var _proto=CustomSelect.prototype;return _proto.reset=function(){this._$dropdown.hide().empty(),this._$value.off("click"),this._fill()},_proto._init=function(){this._$element=$('<div class="'+this._options.block+'">\n           <button class="'+this._options.block+"__option "+this._options.block+'__option--value" type="button"></button>\n           <div class="'+this._options.block+'__dropdown" style="display: none;"></div>\n         </div>'),this._$select.hide().after(this._$element),this._options.modifier&&this._$element.addClass(this._options.modifier),this._$value=this._$element.find("."+this._options.block+"__option--value"),this._$dropdown=this._$element.find("."+this._options.block+"__dropdown"),this._fill()},_proto._fill=function(){var _this=this;this._$values=this._$select.find("option"),this._values=[];var placeholder=this._options.placeholder;$.each(this._$values,function(i,option){var el=$(option).text().trim();_this._values.push(el)}),placeholder&&(this._$select.find("[selected]").length?placeholder=!1:(this._$value.html(placeholder),this._$select.prop("selectedIndex",-1))),$.each(this._values,function(i,el){var cssClass=_this._$values.eq(i).attr("class"),$option=$('<button class="'+_this._options.block+'__option" type="button">'+el+"</button>"),$selected=_this._$select.find(":selected");_this._$values.eq(i).attr("disabled")&&$option.prop("disabled",!0),!$selected.length&&0===i||el===$selected.text().trim()?(placeholder||_this._$value.text(el).removeClass(_this._$value.data("class")).removeData("class").addClass(cssClass).data("class",cssClass),(_this._options.includeValue||placeholder)&&($option.addClass(cssClass),$option.toggleClass(_this._optionSelectedModifier,_this._$values.eq(i).is("[selected]")),_this._$dropdown.append($option))):($option.addClass(cssClass),_this._$dropdown.append($option))}),this._$options=this._$dropdown.find("."+this._options.block+"__option"),this._options.search&&this._search(),this._$value.one("click",function(event){_this._show(event)}),this._$options.length||this._$value.prop("disabled",!0),this._$options.on("click",function(event){_this._select(event)})},_proto._show=function(event){var _this2=this;event.preventDefault(),this._dropup(),$(window).on("resize scroll",this._dropup),this._$element.addClass(this._activeModifier),this._$dropdown.slideDown(this._options.transition,function(){_this2._options.search&&(_this2._$input.focus(),_this2._options.includeValue&&_this2._scroll()),"function"==typeof _this2._options.showCallback&&_this2._options.showCallback.call(_this2._$element[0])}),setTimeout(function(){$(document).on("touchstart click",_this2._outside)},0),this._$value.one("click",function(event){event.preventDefault(),_this2._hide()}),this._options.keyboard&&(this._options.index=-1,$(window).on("keydown",this._keydown))},_proto._hide=function(){var _this3=this;this._options.search&&(this._$input.val("").blur(),this._$options.show(),this._$wrap.scrollTop(0)),this._$dropdown.slideUp(this._options.transition,function(){_this3._$element.removeClass(_this3._activeModifier).removeClass(_this3._dropupModifier),"function"==typeof _this3._options.hideCallback&&_this3._options.hideCallback.call(_this3._$element[0]),_this3._$value.off("click").one("click",function(event){_this3._show(event)}),$(document).off("touchstart click",_this3._outside),$(window).off("resize scroll",_this3._dropup)}),this._options.keyboard&&(this._$options.blur(),$(window).off("keydown",this._keydown))},_proto._scroll=function(){var _this4=this;$.each(this._$options,function(i,option){var $option=$(option);if($option.text()===_this4._$value.text()){var top=$option.position().top,center=_this4._$wrap.outerHeight()/2-$option.outerHeight()/2;return center<top&&_this4._$wrap.scrollTop(top-center),!1}})},_proto._select=function(event){var _this5=this;event.preventDefault();var choice=$(event.currentTarget).text().trim(),values=this._values.concat();if(this._$value.text(choice).removeClass(this._$value.data("class")),this._$values.prop("selected",!1),$.each(values,function(i,el){_this5._options.includeValue||el!==choice||values.splice(i,1),$.each(_this5._$values,function(i,option){var $option=$(option);if($option.text().trim()===choice){var cssClass=$option.attr("class");$option.prop("selected",!0),_this5._$value.addClass(cssClass).data("class",cssClass)}})}),this._hide(),this._options.includeValue)this._$options.removeClass(this._optionSelectedModifier),$.each(this._$options,function(i,option){var $option=$(option);if($option.text().trim()===choice)return $option.addClass(_this5._optionSelectedModifier),!1});else{if(this._$options.length>values.length){var last=this._$options.eq(values.length);last.remove(),this._$options=this._$options.not(last),this._$options.length||this._$value.prop("disabled",!0)}$.each(this._$options,function(i,option){var $option=$(option);$option.text(values[i]),$option.attr("class",_this5._options.block+"__option"),$.each(_this5._$values,function(){var $this=$(this);$this.text().trim()===values[i]&&$option.addClass($this.attr("class"))})})}void 0!==event.originalEvent&&this._$select.trigger("change")},_proto._search=function(){var _this6=this;this._$input=$('<input class="'+this._options.block+'__input" autocomplete="off">'),this._$dropdown.prepend(this._$input),this._$options.wrapAll('<div class="'+this._options.block+'__option-wrap"></div>'),this._$wrap=this._$element.find("."+this._options.block+"__option-wrap"),this._$input.on("focus",function(){_this6._options.index=-1}),this._$input.on("keyup",function(){var query=_this6._$input.val().trim();query.length?(_this6._$wrap.scrollTop(0),setTimeout(function(){query===_this6._$input.val().trim()&&$.each(_this6._$options,function(i,option){var $option=$(option),match=-1!==$option.text().trim().toLowerCase().indexOf(query.toLowerCase());$option.toggle(match)})},300)):_this6._$options.show()})},_proto._dropup=function(){var bottom=this._$element[0].getBoundingClientRect().bottom,up=$(window).height()-bottom<this._$dropdown.height();this._$element.toggleClass(this._dropupModifier,up)},_proto._outside=function(event){var $target=$(event.target);$target.parents().is(this._$element)||$target.is(this._$element)||this._hide()},_proto._keydown=function(event){var $visible=this._$options.filter(":visible").not("[disabled]");switch(event.keyCode){case 40:event.preventDefault(),$visible.eq(this._options.index+1).length?this._options.index+=1:this._options.index=0,$visible.eq(this._options.index).focus();break;case 38:event.preventDefault(),$visible.eq(this._options.index-1).length&&0<=this._options.index-1?this._options.index-=1:this._options.index=$visible.length-1,$visible.eq(this._options.index).focus();break;case 13:case 32:if(!this._$input||!this._$input.is(":focus")){event.preventDefault();var $option=this._$options.add(this._$value).filter(":focus");$option.trigger("click"),$option.is(this._$value)||this._$select.trigger("change"),this._$value.focus()}break;case 27:event.preventDefault(),this._hide(),this._$value.focus()}},CustomSelect._jQueryPlugin=function(config){return this.each(function(){var $this=$(this),data=$this.data("custom-select");data?"reset"===config&&data.reset():"string"!=typeof config&&(data=new CustomSelect(this,config),$this.data("custom-select",data))})},CustomSelect}();return $.fn.customSelect=CustomSelect._jQueryPlugin,$.fn.customSelect.noConflict=function(){return $.fn.customSelect},CustomSelect}($);

    // Clicks
    $("#settings-trigger").click(function(){
        ToggleSettings();
        ShowSettings();
    });
    
    $("#save-settings").click(function(){
        ApplySettingsChanges(true);
    });
    
    $("#refresh-overlay").click(function(){
        ApplySettingsChanges();
    });
    
    $("#reset-settings").click(function(){
        ToggleResetConfirm();
    });
    
    $("#confirmed-reset-settings").click(function(){
        localStorage.removeItem("overlay-"+ filename);
        ApplySettingsChanges();
    });
    
    $("#backout-reset-settings").click(function(){
        ToggleResetConfirm();
    });
    
    $("div[data-modal-close]").click(function(){
        ToggleSettings();
    });
    
    $("#settings-form-themes").change(function(){
        UpdateInfobarPreview($(this).val());
    });


});