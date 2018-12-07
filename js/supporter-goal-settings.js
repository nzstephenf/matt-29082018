/**
 * Matt Sohinki Stream
 * Overlay and Screen Global Settings
 */

var countdownObj, activeSupporters, activeCountdown, activeNotice, noticesData, noticeUrlCurrent, developerCount = 0;

$(function(){
    // Settings Section Local Storage Variables
    if(!localStorage.getItem("supporters-overlay")) createStorageItem("supporters-overlay");
    if(!localStorage.getItem("countdown")) createStorageItem("countdown");
    if(!localStorage.getItem("notice-cta")) createStorageItem("notice-cta");
    
    var activeSupporters = JSON.parse(localStorage.getItem("supporters-overlay"));
    var activeCountdown = JSON.parse(localStorage.getItem("countdown"));
    var activeNotice = JSON.parse(localStorage.getItem("notice-cta"));
    
    // Form Fields
    var form__supporters__current = $("#supporters-form-current"),
    form__supporters__goal = $("#supporters-form-goal"), 
    form__supporters__position = $("#supporters-form-position"),
    form__supporters__state = $("#supporters-form-state"),
    form__notice__notice = $("#notice-form-notice"),
    form__notice__delay = $("#notice-form-delay"),
    form__notice__duration = $("#notice-form-duration"),
    form__countdown__minutes = $("#countdown-form-minutes"),
    form__countdown__seconds = $("#countdown-form-seconds"),
    form__countdown__state = $("#countdown-form-state"),
    form__countdown__showStartingSoon = $("#countdown-form-show-startingsoon"),
    form__countdown__showBeRightBack = $("#countdown-form-show-berightback"),
    form__countdown__showOverlay = $("#countdown-form-show-overlay");
    
    settingsInit();
    
    /**
     * Create storage objects if not present
     */
    function createStorageItem(storageItemId = ""){
        switch(storageItemId){
            case "supporters-overlay":
                localStorage.setItem("supporters-overlay", JSON.stringify({
                    "current": 0,
                    "goal": 100,
                    "position": "bottom-left",
                    "state": false
                }));
                break;
            case "countdown":
                localStorage.setItem("countdown", JSON.stringify({
                    "minutes": 1,
                    "seconds": 59,
                    "state": false
                }));
                break;
            case "notice-cta":
                var date = new Date();
                localStorage.setItem("notice-cta", JSON.stringify({
                    "timestamp": date.getTime(), 
                    "notice": "fb_supporter",
                    "notice_url": "/notices/supporter.html",
                    "delay": 5,
                    "duration": 30
                }));
                break;
        }
        
    }
    
    /**
     * Settings Initialise
     * --
     * Get cookie data and load into the settings page
     */
    function settingsInit(){
        $.ajax({
            url: "/app/data/overlay.json",
            async: false,
            dataType: "json",
            contentType: "application/json",
            success: function(data){
                noticesData = data.notices;
                
                $.each(noticesData, function(i, noticeItem){
                    if(noticeItem.id === activeNotice["notice"]){
                        activeNotice["notice_url"] = noticeItem.url;
                        noticeUrlCurrent = noticeItem.url;
                        if(noticeItem.override) activeNotice["notice_override"] = noticeItem.override;
                        $("#notice-form-notice").append("<option value=\""+ noticeItem.id+"\" data-notice-url=\""+ noticeItem.url +"\" data-override=\""+ noticeItem.override +"\" selected=\"selected\">"+noticeItem.title+"</option>");
                    } else {
                        if(noticeItem.override) activeNotice["notice_override"] = noticeItem.override;
                        $("#notice-form-notice").append("<option value=\""+ noticeItem.id+"\" data-notice-url=\""+ noticeItem.url +"\" data-override=\""+ noticeItem.override +"\">"+noticeItem.title+"</option>");
                    }
                });
            }
        });
        
        form__supporters__current.val(activeSupporters["current"]);
        form__supporters__goal.val(activeSupporters["goal"]);
        form__supporters__position.val(activeSupporters["position"]);
        form__supporters__state.val(activeSupporters["state"]);
        UpdateNoticeSection(activeNotice["notice"]);
        
        form__notice__notice.val(activeNotice["notice"]);
        form__notice__delay.val(activeNotice["delay"]);
        form__notice__duration.val(activeNotice["duration"]);
        
        form__countdown__minutes.val(GetCountdown("minute"));
        form__countdown__seconds.val(GetCountdown("second"));
        form__countdown__showBeRightBack.val(activeCountdown["show_berightback"]);
        form__countdown__showOverlay.val(activeCountdown["show_overlay"]);
        form__countdown__showStartingSoon.val(activeCountdown["show_startingsoon"]);
        
        if(activeCountdown["show_berightback"]) form__countdown__showBeRightBack.attr("checked", true);
        if(activeCountdown["show_overlay"]) form__countdown__showOverlay.attr("checked", true);
        if(activeCountdown["show_startingsoon"]) form__countdown__showStartingSoon.attr("checked", true);
        
        form__countdown__state.val(activeCountdown["state"]);
        $("[data-countdown-minutes]").text(GetCountdown("minute"));
        $("[data-countdown-seconds]").text(GetCountdown("second"));
        
        if(activeCountdown["state"] === true){
            ToggleCountdownStateButton("start");
        } else {
            ToggleCountdownStateButton("stop");
        }
        
        // Set tab id 1 to be default landing
        $('#menu ul li[data-tab="1"]').addClass("active");
        $('.tab[data-tab="1"]').addClass("active");
        
        // Activate custom select to all select dropdowns
        $("select").customSelect();
        
        // Initialise the countdownObj loop if countdown state is true
        if(activeCountdown["state"] === "true"){
            countdownObj = setInterval(function(){
                UpdateCountdown();
            }, 1000);
        }
    }
    
    /**
     * Click Functions
     * --
     * 1) Toggle Menu
     * 2) Save Supporter Goal
     * 3) Save Countdown Updates
     * 4) Save Notice/Call to Action
     * 5) Start Countdown (Change State)
     * 6) Stop Countdown (Change State)
     * 7) Change Notice Behaviour
     */
    
    $("#menu ul li").click(function(){
        ToggleNav($(this).attr("data-tab"));
    });
    
    $("#save-supporter-goal").click(function(){
        SaveSupporterGoalSettings();
    });
    
    $("#save-countdown").click(function(){
        SaveCountdownSettings();
    });
    
    $("#save-noticecta").click(function(){
        SaveNoticeCallToActionSettings();
    })
    
    $("#start-countdown").click(function(){
        StartCountdown();
        ToggleCountdownStateButton("start");
    });
    
    $("#stop-countdown").click(function(){
        StopCountdown();
        ToggleCountdownStateButton("stop");
    });
    
    $("#notice-form-notice").change(function(){
        UpdateNoticeSection($(this).val());
        GetNoticeUrl($(this).val());
    });
    
    $("#success-dialog").click(function(){
        $("#success-dialog").removeClass("active");
    });
    
    $("#menu-title-heading").click(function(){
        if(developerCount < 3) developerCount++;
        
        if(developerCount === 3){
            developerCount = 0;
            if($("#menu ul li.under-development").hasClass("under-development")){
                $("#menu ul li.under-development").removeClass("under-development");
            } else {
                $("#menu ul li[data-WIP]").addClass("under-development");
            }
        }
        
    });
    
    /**
     * Get Notice URL
     */
    function GetNoticeUrl(noticeId = ""){
        $.each(noticesData, function(i, noticeItem){
            if(noticeItem.id === noticeId) noticeUrlCurrent = noticeItem.url;
        });
    }
    
    /**
     * Update Notice Section
     */
    function UpdateNoticeSection(chosenOne){
        // change availablility of fields
        $.each(noticesData, function(i, noticeItem){
            if(noticeItem.id === chosenOne){
                if(noticeItem.override === true){
                    $("#notice-form-duration").attr("disabled", "");
                    $("#notice-form-delay").attr("disabled", "");
                    $('.alert-block[data-field-id="notice_override"]').addClass("active info");
                    $("#notice-form").addClass("hide");
                } else {
                    $("#notice-form-duration").removeAttr("disabled");
                    $("#notice-form-delay").removeAttr("disabled");
                    $('.alert-block[data-field-id="notice_override"]').removeClass("active");
                    $("#notice-form").removeClass("hide");
                }
            }
        });        
    }
    
    /**
     * Menu Tab Switch
     */
    function ToggleNav(tabId = 0){
        $("#menu ul li.active").removeClass("active"); // remove current active
        $(".tab.active").removeClass("active"); // remove current active
        
        $('#menu ul li[data-tab="'+ tabId +'"]').addClass("active");
        $('.tab[data-tab="'+ tabId +'"').addClass("active");
    }
    
    /**
     * Supporter Goal Success Dialog
     */
    function SupporterGoalSuccessDialog(msgId = 0){
        var DialogContent = SuccessModal(msgId);
        
        $("#success-dialog-title").text(DialogContent.header);
        $("#success-dialog-content").text(DialogContent.body);
        $("#success-dialog").addClass("active");
        
        setTimeout(function(){
            $("#success-dialog").removeClass("active");
        }, 3 * 1000);
    }
    
    /**
     * Save Supporter Goal Settings
     */
    function SaveSupporterGoalSettings(){
        var processedFormState, date = new Date();
        
        if(form__supporters__state.val() !== null){
            processedFormState = form__supporters__state.val();
        } else {
            processedFormState = true;
        }
        
        activeSupporters = {
            "timestamp": date.getTime(),
            "current": form__supporters__current.val(),
            "goal": form__supporters__goal.val(),
            "position": form__supporters__position.val(),
            "state": processedFormState
        };
        
        localStorage.setItem("supporters-overlay", JSON.stringify(activeSupporters));
        SupporterGoalSuccessDialog(0);
    }
    
    /**
     * Save Notice/Call To Action Settings
     */
    function SaveNoticeCallToActionSettings(){
        var date = new Date();
        
        var newStoredData = {
            "timestamp": date.getTime(),
            "notice": form__notice__notice.val(),
            "notice_url": noticeUrlCurrent,
            "delay": form__notice__delay.val(),
            "duration": form__notice__duration.val()
        };
        
        localStorage.setItem("notice-cta", JSON.stringify(newStoredData));
        SupporterGoalSuccessDialog(1);
    }
    
    /**
     * Save Countdown Settings
     */
    function SaveCountdownSettings(){
        var date = new Date(), countdownStartingSoon = "false", countdownBrb = "false", countdownOverlay = "false";
        
        if(document.getElementById("countdown-form-show-startingsoon").checked) countdownStartingSoon = "true";
        if(document.getElementById("countdown-form-show-berightback").checked) countdownBrb = "true";
        if(document.getElementById("countdown-form-show-overlay").checked) countdownOverlay = "true";
        
        activeCountdown["timestamp"] = date.getTime();
        activeCountdown["minutes"] = parseFloat(form__countdown__minutes.val());
        activeCountdown["seconds"] = parseFloat(form__countdown__seconds.val());
        activeCountdown["show_startingsoon"] = countdownStartingSoon;
        activeCountdown["show_berightback"] = countdownBrb;
        activeCountdown["show_overlay"] = countdownOverlay;
        
        localStorage.setItem("countdown", JSON.stringify(activeCountdown));
    }
    
    /**
     * Update Countdown State
     */
    function SaveCountdownState(state = false){
        activeCountdown["state"] = state;
        localStorage.setItem("countdown", JSON.stringify(activeCountdown));
    }
    
    /**
     * Start Countdown
     */
    function StartCountdown(){
        SaveCountdownState(true);
        
        countdownObj = setInterval(function(){
            UpdateCountdown();
        }, 1000);
    }
    
    /**
     * Start Countdown
     */
    function StopCountdown(){
        SaveCountdownState(false);
        clearInterval(countdownObj);
        var date = new Date();

        activeCountdown["timestamp"] = date.getTime();
        activeCountdown["minutes"] = activeCountdown["minutes"];
        activeCountdown["seconds"] = activeCountdown["seconds"];
        localStorage.setItem("countdown", JSON.stringify(activeCountdown));
        
        ToggleCountdownStateButton("stop");
    }
    
    /**
     * Update Countdown, set in for loop
     */
    function UpdateCountdown(){
        DecrementTimer();
    }
    
    /**
     * Decrement Timer
     */
    function DecrementTimer(){
        var maxMinute = 59, maxSecond = 59, minMinute = 0, minSecond = 0;
        
        if(activeCountdown["minutes"] === minMinute && activeCountdown["seconds"] === minSecond){
            StopCountdown();
            activeCountdown["minutes"] = 0;
            activeCountdown["seconds"] = 0;
        }
        
        if(activeCountdown["seconds"] === 0){
            if(activeCountdown["minutes"] !== 0 && activeCountdown["second"] !== 0) activeCountdown["seconds"] = maxSecond;
            if(activeCountdown["minutes"] > 0) activeCountdown["minutes"]--;
        } else {
            activeCountdown["seconds"]--;
        }
        
        $("[data-countdown-minutes]").text(GetCountdown("minute"));
        $("[data-countdown-seconds]").text(GetCountdown("second"));
    }
    
    /**
     * Get Countdown
     */
    function GetCountdown(type = "second"){
        var cMinute, cSecond;

        switch(type){
            case "minute":
                cMinute = activeCountdown["minutes"];
                return cMinute;
                break;
            case "second":
                if(activeCountdown["seconds"] <= 9){
                    cSecond = "0"+ activeCountdown["seconds"];
                } else {
                    cSecond = activeCountdown["seconds"];
                }
                return cSecond;
                break;
        }
    }
    
    /**
     * Countdown Button Disable Toggle
     */
    function ToggleCountdownStateButton(state = "stop"){
        switch(state){
            case "start":
                $("#start-countdown").attr("disabled", true);
                $("#stop-countdown").attr("disabled", false);
                break;
            case "stop":
                $("#start-countdown").attr("disabled", false);
                $("#stop-countdown").attr("disabled", true);
                break;
            default:
                break;
        }
    }
    
    function SuccessModal(msgId = 0){
        var msgHeader, msgContent;

        switch(msgId){
            case 0:
                msgHeader = "Supporter Goal updated!";
                msgContent = "Goal updates will appear on the overlay within the next 5 seconds.";
                break;
            case 1:
                msgHeader = "Overlay/CTA updated!";
                msgContent = "Updates will appear on the overlay within the next 5 seconds.";
                break;
        }

        return {
            "header": msgHeader,
            "body": msgContent
        };
    }
    /**
     * Check whether or not an assumed value equals a cookie's value.
     */
    function CompareToCookie(value = "", cookieId = ""){
        if(value === getCookie(cookieId)) return true;
        return false;
    }

});

/**
 * Custom Select for Dropdowns, due to OBS browser dropdown select issue
 */
function _extends(){return(_extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key])}return target}).apply(this,arguments)}var CustomSelect=function($){var defaults={block:"custom-select",hideCallback:!1,includeValue:!1,keyboard:!0,modifier:!1,placeholder:!1,search:!1,showCallback:!1,transition:0},CustomSelect=function(){function CustomSelect(select,options){this._$select=$(select),this._options=_extends({},defaults,"object"==typeof options?options:{}),this._activeModifier=this._options.block+"--active",this._dropupModifier=this._options.block+"--dropup",this._optionSelectedModifier=this._options.block+"__option--selected",this._keydown=this._keydown.bind(this),this._dropup=this._dropup.bind(this),this._outside=this._outside.bind(this),this._init()}var _proto=CustomSelect.prototype;return _proto.reset=function(){this._$dropdown.hide().empty(),this._$value.off("click"),this._fill()},_proto._init=function(){this._$element=$('<div class="'+this._options.block+'">\n           <button class="'+this._options.block+"__option "+this._options.block+'__option--value" type="button"></button>\n           <div class="'+this._options.block+'__dropdown" style="display: none;"></div>\n         </div>'),this._$select.hide().after(this._$element),this._options.modifier&&this._$element.addClass(this._options.modifier),this._$value=this._$element.find("."+this._options.block+"__option--value"),this._$dropdown=this._$element.find("."+this._options.block+"__dropdown"),this._fill()},_proto._fill=function(){var _this=this;this._$values=this._$select.find("option"),this._values=[];var placeholder=this._options.placeholder;$.each(this._$values,function(i,option){var el=$(option).text().trim();_this._values.push(el)}),placeholder&&(this._$select.find("[selected]").length?placeholder=!1:(this._$value.html(placeholder),this._$select.prop("selectedIndex",-1))),$.each(this._values,function(i,el){var cssClass=_this._$values.eq(i).attr("class"),$option=$('<button class="'+_this._options.block+'__option" type="button">'+el+"</button>"),$selected=_this._$select.find(":selected");_this._$values.eq(i).attr("disabled")&&$option.prop("disabled",!0),!$selected.length&&0===i||el===$selected.text().trim()?(placeholder||_this._$value.text(el).removeClass(_this._$value.data("class")).removeData("class").addClass(cssClass).data("class",cssClass),(_this._options.includeValue||placeholder)&&($option.addClass(cssClass),$option.toggleClass(_this._optionSelectedModifier,_this._$values.eq(i).is("[selected]")),_this._$dropdown.append($option))):($option.addClass(cssClass),_this._$dropdown.append($option))}),this._$options=this._$dropdown.find("."+this._options.block+"__option"),this._options.search&&this._search(),this._$value.one("click",function(event){_this._show(event)}),this._$options.length||this._$value.prop("disabled",!0),this._$options.on("click",function(event){_this._select(event)})},_proto._show=function(event){var _this2=this;event.preventDefault(),this._dropup(),$(window).on("resize scroll",this._dropup),this._$element.addClass(this._activeModifier),this._$dropdown.slideDown(this._options.transition,function(){_this2._options.search&&(_this2._$input.focus(),_this2._options.includeValue&&_this2._scroll()),"function"==typeof _this2._options.showCallback&&_this2._options.showCallback.call(_this2._$element[0])}),setTimeout(function(){$(document).on("touchstart click",_this2._outside)},0),this._$value.one("click",function(event){event.preventDefault(),_this2._hide()}),this._options.keyboard&&(this._options.index=-1,$(window).on("keydown",this._keydown))},_proto._hide=function(){var _this3=this;this._options.search&&(this._$input.val("").blur(),this._$options.show(),this._$wrap.scrollTop(0)),this._$dropdown.slideUp(this._options.transition,function(){_this3._$element.removeClass(_this3._activeModifier).removeClass(_this3._dropupModifier),"function"==typeof _this3._options.hideCallback&&_this3._options.hideCallback.call(_this3._$element[0]),_this3._$value.off("click").one("click",function(event){_this3._show(event)}),$(document).off("touchstart click",_this3._outside),$(window).off("resize scroll",_this3._dropup)}),this._options.keyboard&&(this._$options.blur(),$(window).off("keydown",this._keydown))},_proto._scroll=function(){var _this4=this;$.each(this._$options,function(i,option){var $option=$(option);if($option.text()===_this4._$value.text()){var top=$option.position().top,center=_this4._$wrap.outerHeight()/2-$option.outerHeight()/2;return center<top&&_this4._$wrap.scrollTop(top-center),!1}})},_proto._select=function(event){var _this5=this;event.preventDefault();var choice=$(event.currentTarget).text().trim(),values=this._values.concat();if(this._$value.text(choice).removeClass(this._$value.data("class")),this._$values.prop("selected",!1),$.each(values,function(i,el){_this5._options.includeValue||el!==choice||values.splice(i,1),$.each(_this5._$values,function(i,option){var $option=$(option);if($option.text().trim()===choice){var cssClass=$option.attr("class");$option.prop("selected",!0),_this5._$value.addClass(cssClass).data("class",cssClass)}})}),this._hide(),this._options.includeValue)this._$options.removeClass(this._optionSelectedModifier),$.each(this._$options,function(i,option){var $option=$(option);if($option.text().trim()===choice)return $option.addClass(_this5._optionSelectedModifier),!1});else{if(this._$options.length>values.length){var last=this._$options.eq(values.length);last.remove(),this._$options=this._$options.not(last),this._$options.length||this._$value.prop("disabled",!0)}$.each(this._$options,function(i,option){var $option=$(option);$option.text(values[i]),$option.attr("class",_this5._options.block+"__option"),$.each(_this5._$values,function(){var $this=$(this);$this.text().trim()===values[i]&&$option.addClass($this.attr("class"))})})}void 0!==event.originalEvent&&this._$select.trigger("change")},_proto._search=function(){var _this6=this;this._$input=$('<input class="'+this._options.block+'__input" autocomplete="off">'),this._$dropdown.prepend(this._$input),this._$options.wrapAll('<div class="'+this._options.block+'__option-wrap"></div>'),this._$wrap=this._$element.find("."+this._options.block+"__option-wrap"),this._$input.on("focus",function(){_this6._options.index=-1}),this._$input.on("keyup",function(){var query=_this6._$input.val().trim();query.length?(_this6._$wrap.scrollTop(0),setTimeout(function(){query===_this6._$input.val().trim()&&$.each(_this6._$options,function(i,option){var $option=$(option),match=-1!==$option.text().trim().toLowerCase().indexOf(query.toLowerCase());$option.toggle(match)})},300)):_this6._$options.show()})},_proto._dropup=function(){var bottom=this._$element[0].getBoundingClientRect().bottom,up=$(window).height()-bottom<this._$dropdown.height();this._$element.toggleClass(this._dropupModifier,up)},_proto._outside=function(event){var $target=$(event.target);$target.parents().is(this._$element)||$target.is(this._$element)||this._hide()},_proto._keydown=function(event){var $visible=this._$options.filter(":visible").not("[disabled]");switch(event.keyCode){case 40:event.preventDefault(),$visible.eq(this._options.index+1).length?this._options.index+=1:this._options.index=0,$visible.eq(this._options.index).focus();break;case 38:event.preventDefault(),$visible.eq(this._options.index-1).length&&0<=this._options.index-1?this._options.index-=1:this._options.index=$visible.length-1,$visible.eq(this._options.index).focus();break;case 13:case 32:if(!this._$input||!this._$input.is(":focus")){event.preventDefault();var $option=this._$options.add(this._$value).filter(":focus");$option.trigger("click"),$option.is(this._$value)||this._$select.trigger("change"),this._$value.focus()}break;case 27:event.preventDefault(),this._hide(),this._$value.focus()}},CustomSelect._jQueryPlugin=function(config){return this.each(function(){var $this=$(this),data=$this.data("custom-select");data?"reset"===config&&data.reset():"string"!=typeof config&&(data=new CustomSelect(this,config),$this.data("custom-select",data))})},CustomSelect}();return $.fn.customSelect=CustomSelect._jQueryPlugin,$.fn.customSelect.noConflict=function(){return $.fn.customSelect},CustomSelect}($);
