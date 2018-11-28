/**
 * Matt Sohinki Stream
 * Overlay and Screen Global Settings
 */

var countdownObj, activeSupporters, activeCountdown;

$(function(){
    // Settings Section Cookie Variables
    var cookie__supporters__current = GetCookie("supporters_overlay_current"),
    cookie__supporters__goal = GetCookie("supporters_overlay_goal"),
    cookie__supporters__position = GetCookie("supporters_overlay_position"),
    cookie__supporters__state = GetCookie("supporters_overlay_state"),
    cookie__countdown__minutes = GetCookie("countdown_minutes"),
    cookie__countdown__seconds = GetCookie("countdown_seconds"),
    cookie__countdown__state = GetCookie("countdown_state"),
    cookie__countdown__showStartingSoon = GetCookie("countdown_visible_startingsoon"),
    cookie__countdown__showBeRightBack = GetCookie("countdown_visible_berightback"),
    cookie__countdown__showOverlay = GetCookie("countdown_visible_overlay");
    
    activeSupporters = {
        "current": cookie__supporters__current,
        "goal": cookie__supporters__goal,
        "position": cookie__supporters__position,
        "state": cookie__supporters__state
    };
    
    activeCountdown = {
        "minutes": parseFloat(cookie__countdown__minutes),
        "seconds": parseFloat(cookie__countdown__seconds),
        "state": cookie__countdown__state,
        "show_startingsoon": cookie__countdown__showStartingSoon,
        "show_berightback": cookie__countdown__showBeRightBack,
        "show_overlay": cookie__countdown__showOverlay
    };
    
    // Form Fields
    var form__supporters__current = $("#supporters-form-current"),
    form__supporters__goal = $("#supporters-form-goal"), 
    form__supporters__position = $("#supporters-form-position"),
    form__supporters__state = $("#supporters-form-state"),
    form__countdown__minutes = $("#countdown-form-minutes"),
    form__countdown__seconds = $("#countdown-form-seconds"),
    form__countdown__state = $("#countdown-form-state"),
    form__countdown__showStartingSoon = $("#countdown-form-show-startingsoon"),
    form__countdown__showBeRightBack = $("#countdown-form-show-berightback"),
    form__countdown__showOverlay = $("#countdown-form-show-overlay");
    
    settingsInit();
    
    /**
     * Settings Initialise
     * --
     * Get cookie data and load into the settings page
     */
    function settingsInit(){
        form__supporters__current.val(activeSupporters["current"]);
        form__supporters__goal.val(activeSupporters["goal"]);
        form__supporters__position.val(activeSupporters["position"]);
        form__supporters__state.val(activeSupporters["state"]);
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
     * 4) Start Countdown (Change State)
     * 5) Stop Countdown (Change State)
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
    
    $("#start-countdown").click(function(){
        StartCountdown();
        ToggleCountdownStateButton("start");
    });
    
    $("#stop-countdown").click(function(){
        StopCountdown();
        ToggleCountdownStateButton("stop");
    });
    
    $("#success-dialog").click(function(){
        $("#success-dialog").removeClass("active");
    });
    
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
     * Clear Supporter, Countdown Settings and Countdown State
     */
    function ClearSupporterSettings(){
        RemoveCookie("supporters_overlay_current");
        RemoveCookie("supporters_overlay_goal");
        RemoveCookie("supporters_overlay_position");
        RemoveCookie("supporters_overlay_state");
    }
    
    function ClearCountdownSettings(){
        RemoveCookie("countdown_minutes");
        RemoveCookie("countdown_seconds");
        RemoveCookie("countdown_visible_startingsoon");
        RemoveCookie("countdown_visible_berightback");
        RemoveCookie("countdown_visible_overlay");
    }
    
    function ClearCountdownState(){
        RemoveCookie("countdown_state");
    }
    
    /**
     * Supporter Goal Success Dialog
     */
    function SupporterGoalSuccessDialog(){
        $("#success-dialog").addClass("active");
        
        setTimeout(function(){
            $("#success-dialog").removeClass("active");
        }, 3 * 1000);
    }
    
    /**
     * Save Supporter Goal Settings
     */
    function SaveSupporterGoalSettings(){
        ClearSupporterSettings();
        SetCookie("supporters_overlay_current", form__supporters__current.val());
        SetCookie("supporters_overlay_goal", form__supporters__goal.val());
        SetCookie("supporters_overlay_position", form__supporters__position.val());
        SetCookie("supporters_overlay_state", form__supporters__state.val());
        
        activeSupporters = {
            "current": form__supporters__current.val(),
            "goal": form__supporters__goal.val(),
            "position": form__supporters__position.val(),
            "state": form__supporters__state.val()
        };
        
        SupporterGoalSuccessDialog();
    }
    
    /**
     * Save Countdown Settings
     */
    function SaveCountdownSettings(){
        ClearCountdownSettings();
        var date = new Date(), countdownStartingSoon = "false", countdownBrb = "false", countdownOverlay = "false";
        
        if(document.getElementById("countdown-form-show-startingsoon").checked) countdownStartingSoon = "true";
        if(document.getElementById("countdown-form-show-berightback").checked) countdownBrb = "true";
        if(document.getElementById("countdown-form-show-overlay").checked) countdownOverlay = "true";
        
        SetCookie("countdown_timestamp", date.getTime());
        SetCookie("countdown_minutes", form__countdown__minutes.val());
        SetCookie("countdown_seconds", form__countdown__seconds.val());
        SetCookie("countdown_visible_startingsoon", countdownStartingSoon);
        SetCookie("countdown_visible_brb", countdownBrb);
        SetCookie("countdown_visible_overlay", countdownOverlay);
        
        activeCountdown = {
            "minutes": parseFloat(form__countdown__minutes.val()),
            "seconds": parseFloat(form__countdown__seconds.val()),
            "show_startingsoon": countdownStartingSoon,
            "show_berightback": countdownBrb,
            "show_overlay": countdownOverlay
        };
    }
    
    /**
     * Update Countdown State
     */
    function SaveCountdownState(state = false){
        ClearCountdownState();
        SetCookie("countdown_state", state);
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
        
        RemoveCookie("countdown_timestamp");
        RemoveCookie("countdown_minutes");
        RemoveCookie("countdown_seconds");

        SetCookie("countdown_timestamp", date.getTime());
        SetCookie("countdown_minutes", activeCountdown["minutes"]);
        SetCookie("countdown_seconds", activeCountdown["seconds"]);
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
    
    /**
     * Check whether or not an assumed value equals a cookie's value.
     */
    function CompareToCookie(value = "", cookieId = ""){
        if(value === getCookie(cookieId)) return true;
        return false;
    }

});

/**
 * Retrieve browser cookies with specified cookie name
 */
function GetCookie(name){
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

/**
 * Set cookies for the app to be years from now
 */
function SetCookie(name, value){
    document.cookie = name +"="+ value +"; expires=Tue, 1 Jan 2030 12:00:00 UTC; path=/;";
}

/**
 * Remove cookies from browser by making it expire at the first day of 2018
 */
function RemoveCookie(name){
    document.cookie = name + "=; expires=Mon, 01 Jan 2018 00:00:00 GMT;";
}

/**
 * Remove cookie 'delete' alias
 */
function DeleteCookie(name){
    RemoveCookie(name);
}

/**
 * Provide .reverse() usage with JQuery
 */
jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse());
};

/**
 * Custom Select for Dropdowns, due to OBS browser dropdown select issue
 */
function _extends(){return(_extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key])}return target}).apply(this,arguments)}var CustomSelect=function($){var defaults={block:"custom-select",hideCallback:!1,includeValue:!1,keyboard:!0,modifier:!1,placeholder:!1,search:!1,showCallback:!1,transition:0},CustomSelect=function(){function CustomSelect(select,options){this._$select=$(select),this._options=_extends({},defaults,"object"==typeof options?options:{}),this._activeModifier=this._options.block+"--active",this._dropupModifier=this._options.block+"--dropup",this._optionSelectedModifier=this._options.block+"__option--selected",this._keydown=this._keydown.bind(this),this._dropup=this._dropup.bind(this),this._outside=this._outside.bind(this),this._init()}var _proto=CustomSelect.prototype;return _proto.reset=function(){this._$dropdown.hide().empty(),this._$value.off("click"),this._fill()},_proto._init=function(){this._$element=$('<div class="'+this._options.block+'">\n           <button class="'+this._options.block+"__option "+this._options.block+'__option--value" type="button"></button>\n           <div class="'+this._options.block+'__dropdown" style="display: none;"></div>\n         </div>'),this._$select.hide().after(this._$element),this._options.modifier&&this._$element.addClass(this._options.modifier),this._$value=this._$element.find("."+this._options.block+"__option--value"),this._$dropdown=this._$element.find("."+this._options.block+"__dropdown"),this._fill()},_proto._fill=function(){var _this=this;this._$values=this._$select.find("option"),this._values=[];var placeholder=this._options.placeholder;$.each(this._$values,function(i,option){var el=$(option).text().trim();_this._values.push(el)}),placeholder&&(this._$select.find("[selected]").length?placeholder=!1:(this._$value.html(placeholder),this._$select.prop("selectedIndex",-1))),$.each(this._values,function(i,el){var cssClass=_this._$values.eq(i).attr("class"),$option=$('<button class="'+_this._options.block+'__option" type="button">'+el+"</button>"),$selected=_this._$select.find(":selected");_this._$values.eq(i).attr("disabled")&&$option.prop("disabled",!0),!$selected.length&&0===i||el===$selected.text().trim()?(placeholder||_this._$value.text(el).removeClass(_this._$value.data("class")).removeData("class").addClass(cssClass).data("class",cssClass),(_this._options.includeValue||placeholder)&&($option.addClass(cssClass),$option.toggleClass(_this._optionSelectedModifier,_this._$values.eq(i).is("[selected]")),_this._$dropdown.append($option))):($option.addClass(cssClass),_this._$dropdown.append($option))}),this._$options=this._$dropdown.find("."+this._options.block+"__option"),this._options.search&&this._search(),this._$value.one("click",function(event){_this._show(event)}),this._$options.length||this._$value.prop("disabled",!0),this._$options.on("click",function(event){_this._select(event)})},_proto._show=function(event){var _this2=this;event.preventDefault(),this._dropup(),$(window).on("resize scroll",this._dropup),this._$element.addClass(this._activeModifier),this._$dropdown.slideDown(this._options.transition,function(){_this2._options.search&&(_this2._$input.focus(),_this2._options.includeValue&&_this2._scroll()),"function"==typeof _this2._options.showCallback&&_this2._options.showCallback.call(_this2._$element[0])}),setTimeout(function(){$(document).on("touchstart click",_this2._outside)},0),this._$value.one("click",function(event){event.preventDefault(),_this2._hide()}),this._options.keyboard&&(this._options.index=-1,$(window).on("keydown",this._keydown))},_proto._hide=function(){var _this3=this;this._options.search&&(this._$input.val("").blur(),this._$options.show(),this._$wrap.scrollTop(0)),this._$dropdown.slideUp(this._options.transition,function(){_this3._$element.removeClass(_this3._activeModifier).removeClass(_this3._dropupModifier),"function"==typeof _this3._options.hideCallback&&_this3._options.hideCallback.call(_this3._$element[0]),_this3._$value.off("click").one("click",function(event){_this3._show(event)}),$(document).off("touchstart click",_this3._outside),$(window).off("resize scroll",_this3._dropup)}),this._options.keyboard&&(this._$options.blur(),$(window).off("keydown",this._keydown))},_proto._scroll=function(){var _this4=this;$.each(this._$options,function(i,option){var $option=$(option);if($option.text()===_this4._$value.text()){var top=$option.position().top,center=_this4._$wrap.outerHeight()/2-$option.outerHeight()/2;return center<top&&_this4._$wrap.scrollTop(top-center),!1}})},_proto._select=function(event){var _this5=this;event.preventDefault();var choice=$(event.currentTarget).text().trim(),values=this._values.concat();if(this._$value.text(choice).removeClass(this._$value.data("class")),this._$values.prop("selected",!1),$.each(values,function(i,el){_this5._options.includeValue||el!==choice||values.splice(i,1),$.each(_this5._$values,function(i,option){var $option=$(option);if($option.text().trim()===choice){var cssClass=$option.attr("class");$option.prop("selected",!0),_this5._$value.addClass(cssClass).data("class",cssClass)}})}),this._hide(),this._options.includeValue)this._$options.removeClass(this._optionSelectedModifier),$.each(this._$options,function(i,option){var $option=$(option);if($option.text().trim()===choice)return $option.addClass(_this5._optionSelectedModifier),!1});else{if(this._$options.length>values.length){var last=this._$options.eq(values.length);last.remove(),this._$options=this._$options.not(last),this._$options.length||this._$value.prop("disabled",!0)}$.each(this._$options,function(i,option){var $option=$(option);$option.text(values[i]),$option.attr("class",_this5._options.block+"__option"),$.each(_this5._$values,function(){var $this=$(this);$this.text().trim()===values[i]&&$option.addClass($this.attr("class"))})})}void 0!==event.originalEvent&&this._$select.trigger("change")},_proto._search=function(){var _this6=this;this._$input=$('<input class="'+this._options.block+'__input" autocomplete="off">'),this._$dropdown.prepend(this._$input),this._$options.wrapAll('<div class="'+this._options.block+'__option-wrap"></div>'),this._$wrap=this._$element.find("."+this._options.block+"__option-wrap"),this._$input.on("focus",function(){_this6._options.index=-1}),this._$input.on("keyup",function(){var query=_this6._$input.val().trim();query.length?(_this6._$wrap.scrollTop(0),setTimeout(function(){query===_this6._$input.val().trim()&&$.each(_this6._$options,function(i,option){var $option=$(option),match=-1!==$option.text().trim().toLowerCase().indexOf(query.toLowerCase());$option.toggle(match)})},300)):_this6._$options.show()})},_proto._dropup=function(){var bottom=this._$element[0].getBoundingClientRect().bottom,up=$(window).height()-bottom<this._$dropdown.height();this._$element.toggleClass(this._dropupModifier,up)},_proto._outside=function(event){var $target=$(event.target);$target.parents().is(this._$element)||$target.is(this._$element)||this._hide()},_proto._keydown=function(event){var $visible=this._$options.filter(":visible").not("[disabled]");switch(event.keyCode){case 40:event.preventDefault(),$visible.eq(this._options.index+1).length?this._options.index+=1:this._options.index=0,$visible.eq(this._options.index).focus();break;case 38:event.preventDefault(),$visible.eq(this._options.index-1).length&&0<=this._options.index-1?this._options.index-=1:this._options.index=$visible.length-1,$visible.eq(this._options.index).focus();break;case 13:case 32:if(!this._$input||!this._$input.is(":focus")){event.preventDefault();var $option=this._$options.add(this._$value).filter(":focus");$option.trigger("click"),$option.is(this._$value)||this._$select.trigger("change"),this._$value.focus()}break;case 27:event.preventDefault(),this._hide(),this._$value.focus()}},CustomSelect._jQueryPlugin=function(config){return this.each(function(){var $this=$(this),data=$this.data("custom-select");data?"reset"===config&&data.reset():"string"!=typeof config&&(data=new CustomSelect(this,config),$this.data("custom-select",data))})},CustomSelect}();return $.fn.customSelect=CustomSelect._jQueryPlugin,$.fn.customSelect.noConflict=function(){return $.fn.customSelect},CustomSelect}($);