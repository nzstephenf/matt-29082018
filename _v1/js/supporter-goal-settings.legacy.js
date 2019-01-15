/*
 * Manage Supporter Goal
 * --
 * Author: Stephen Falepau
 * File created: 28/10/2018, 1:03pm
 */

// Global-accessible data array variables
var appData = {}, countdownInt, activeSetting = {}, countdown = {};

$(function(){
    var supporters_current = getCookie("supporters_overlay_current");
    var supporters_goal = getCookie("supporters_overlay_total");
    var supporters_position = getCookie("supporters_overlay_position");
    var supporters_show = getCookie("supporters_overlay_state");
    var countdown_startingsoon = getCookie("countdown_visible_startingsoon");
    var countdown_brb = getCookie("countdown_visible_brb");
    var countdown_overlay = getCookie("countdown_visible_startingsoon");
    var countdown_minute = getCookie("countdown_minute");
    var countdown_second = getCookie("countdown_second");
    var countdown_state = getCookie("countdown_state");

    // set tab content on start
    $('#menu ul li[data-tab="1"]').addClass("active");
    $('.tab[data-tab="1"]').addClass("active");

    // menu tab switch
    $("#menu ul li").click(function(){
        $("#menu ul li.active").removeClass("active"); // remove current active
        $(".tab.active").removeClass("active"); // remove current active
        
        $('#menu ul li[data-tab="'+ $(this).attr("data-tab") +'"]').addClass("active");
        $('.tab[data-tab="'+ $(this).attr("data-tab") +'"').addClass("active");
    });
    
    formInit();

    function formInit(){
        countdown["minute"] = countdown_minute;
        countdown["second"] = countdown_second;
        
        $("#form-field--current").val(supporters_current);
        $("#form-field--goal").val(supporters_goal);
        $("#form-field--position").val(supporters_position);
        $("#form-field--show").val(supporters_show);
        
        if(countdown_startingsoon === "true"){
            $("#form-field--displayStartingSoon").val("true");
            $("#form-field--displayStartingSoon").prop("checked", true);
        }
        
        if(countdown_brb === "true"){
            $("#form-field--displayBrb").val("true");
            $("#form-field--displayBrb").prop("checked", true);
        }
        
        if(countdown_overlay === "true"){
            $("#form-field--displayOverlay").val("true");
            $("#form-field--displayOverlay").prop("checked", true);
        }
        
        $("#form-field--minute").val(countdown_minute);
        $("#form-field--second").val(countdown_second);

        $("select").customSelect();
    }
    
    function clearSettings(){
        removeCookie("supporters_overlay_current");
        removeCookie("supporters_overlay_total");
        removeCookie("supporters_overlay_position");
        removeCookie("supporters_overlay_state");
    }
    
    function clearCountdown(){
        removeCookie("countdown_timestamp");
        removeCookie("countdown_visible_startingsoon");
        removeCookie("countdown_visible_brb");
        removeCookie("countdown_visible_overlay");
        removeCookie("countdown_minute");
        removeCookie("countdown_second");
    }
    
    function showSuccess(){
        $("#success-dialog").addClass("active");
        
        setTimeout(function(){
            $("#success-dialog").removeClass("active");
        }, 3 * 1000);
    }
    
    function doSave(){
        setCookie("supporters_overlay_current", $("#form-field--current").val());
        setCookie("supporters_overlay_total", $("#form-field--goal").val());
        setCookie("supporters_overlay_position", $("#form-field--position").val());
        setCookie("supporters_overlay_state", $("#form-field--show").val());
        
        activeSetting["goal_current"] = $("#form-field--current").val();
        activeSetting["goal_total"] = $("#form-field--goal").val();
        activeSetting["goal_position"] = $("#form-field--position").val();
        activeSetting["goal_state"] = $("#form-field--show").val();
        showSuccess();
    }
    
    function doStartCountdown(){
        setCookie("countdown_state", "true");
        countdown["state"] = true;
        
        updateCountdown();
        
        $("#startCountdown").attr("disabled", true);
        $("#stopCountdown").attr("disabled", false);
    }
    
    function doStopCountdown(){
        setCookie("countdown_state", "false");
        countdown["state"] = false;
        
        $("#startCountdown").attr("disabled", false);
        $("#stopCountdown").attr("disabled", true);
        
        clearInterval(countdownInt);
        clearCountdown();
        setCookie("countdown_minute", $("#form-field--minute").val());
        setCookie("countdown_second", $("#form-field--second").val());
    }
    
    countdownInt = setInterval(function(){
        if(countdown["state"] === true) updateCountdown();
    }, 1 * 1000);
    
    function updateCountdown(){
        if(countdown["minute"] === 0 && countdown["second"] === 00 || countdown["state"] === "false"){
            doStopCountdown();
            console.log("Minute and second is zero");
        } else {
            decrementTimer();
            console.log("Decrease time");
        }
    }
    
    function doSaveCountdown(){
        var countdownStartingSoon = "false";
        var countdownBrb = "false";
        var countdownOverlay = "false";
        
        if(document.getElementById("form-field--displayStartingSoon").checked) countdownStartingSoon = "true";
        if(document.getElementById("form-field--displayBrb").checked) countdownBrb = "true";
        if(document.getElementById("form-field--displayOverlay").checked) countdownOverlay = "true";
        
        countdown["visible_startingsoon"] = countdownStartingSoon;
        countdown["visible_brb"] = countdownBrb;
        countdown["visible_overlay"] = countdownOverlay;
        countdown["minute"] = $("#form-field--minute").val();
        countdown["second"] = $("#form-field--second").val();
        
        var date = new Date();
        setCookie("countdown_timestamp", date.getTime());
        setCookie("countdown_visible_startingsoon", countdownStartingSoon);
        setCookie("countdown_visible_brb", countdownBrb);
        setCookie("countdown_visible_overlay", countdownOverlay);
        setCookie("countdown_minute", $("#form-field--minute").val());
        setCookie("countdown_second", $("#form-field--second").val());
    }
    
    $("#save").click(function(){
        clearSettings();
        doSave();
    });
    
    $("#saveCountdown").click(function(){
        clearCountdown();
        doSaveCountdown();
    });
    
    $("#startCountdown").click(function(){
        removeCookie("countdown_state");
        doStartCountdown();
    });
    
    $("#stopCountdown").click(function(){
        removeCookie("countdown_state");
        doStopCountdown();
    });
    
    function incrementTimer(){
        var maxMinute = 59, maxSecond = 59, minMinute = 00, minSecond = 00;
        
        if(countdown["second"] <= maxSecond){
            countdown["second"]++;
        } else {
            countdown["minute"]++;
            countdown["second"] = minSecond; // reset back to zero
        }
    }
    
    function decrementTimer(){
        var maxMinute = 59, maxSecond = 59, minMinute = 00, minSecond = 00;
        
        if(countdown["minute"] === minMinute && countdown["second"] === minSecond) console.log("Zero is the name");
        
        if(countdown["second"] === 0){
            countdown["second"] = maxSecond;
            if(countdown["minute"] > 0) countdown["minute"]--;
        } else {
            countdown["second"]--;
        }
        
        $("[data-countdown-minute]").text(getCountdown("minute"));
        $("[data-countdown-second]").text(getCountdown("second"));
    }
    
});

function getCountdown(type = "second"){
    var cMinute, cSecond;
    
    switch(type){
        case "minute":
            cMinute = countdown["minute"];
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
    document.cookie = name +"="+ value +"; expires=Tue, 1 Jan 2030 12:00:00 UTC; path=/;";
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
