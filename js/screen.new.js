/**
 * Stream Intermission 2019 Update
 */

var appData = {}, activeScreen = {}, socialData = {}, currentLocation = document.location.href,
    filename = currentLocation.substr(currentLocation.lastIndexOf('/') + 1).replace(".html", ""), storedSupporterGoal = localStorage.getItem("supporters-overlay"), storedScreen = localStorage.getItem("screen-"+ filename);

var storedScreen = (storedScreen) ? JSON.parse(storedScreen) : {}, storedSupporterGoal = (storedSupporterGoal) ? JSON.parse(storedSupporterGoal) : {};
var dateVersion = new Date().getTime();
 
$(function(){
    
    var videoPlayer = document.getElementById("video-source");

    $.ajax({
        url: "/app/data/screens.json",
        async: false,
        dataType: "json",
        success: function(data){
            appData = data;
        }
    });
    
    $.ajax({
        url: "/app/layouts/screen/global.html",
        async: false,
        dataType: "html",
        success: function(data){
            $("div#container").append(data);
        }
    });
    
    $.ajax({
        url: "/app/layouts/settings-modal/intermission-screen.html",
        async: false,
        dataType: "html",
        success: function(data){
            $("div#settings-modal").append(data);
        }
    });
    
    activeScreen = {
        "title": "Line One Example Text Copy",
        "secondary": "Line Two Example Text Copy",
        "theme_primary": "#499999",
        "theme_secondary": "#2c7f7f",
        "theme_text": "#f3f3f3",
        "social_preset": "default",
        "social_items": {}
    };
    
    $.each(appData.screen, function(i, item){
        if(item.id === $("html").attr("data-screen")){
            activeScreen["theme"] = item.id;
            activeScreen["title"] = item.title;
            if(item.secondary) activeScreen["secondary"] = item.secondary;
            activeScreen["social_cta"] = item.social_cta;
            if(item.social_preset) activeScreen["social_preset"] = item.social_preset;
            activeScreen["video_url"] = item.video;
            if(item.social_preset) activeScreen["social_preset"] = item.social_preset;
            if(item.colours.primary) activeScreen["theme_primary"] = item.colours.primary;
            if(item.colours.secondary) activeScreen["theme_secondary"] = item.colours.secondary;
            if(item.colours.triangle) activeScreen["theme_triangle"] = item.colours.triangle;
            if(item.colours.text) activeScreen["theme_text"] = item.colours.text;
            if(item.show_video) activeScreen["theme_show_video"] = item.show_video;
            if(item.show_video) activeScreen["theme_volume"] = item.volume;
            activeScreen["theme_art"] = item.game_art;
            activeScreen["theme_footer"] = item.footer;
            activeScreen["theme_chairhinki"] = item.chairhinki;
            activeScreen["theme_show_chairhinki"] = item.show_chairhinki;
        }
    });
    
    $.each(appData.social, function(i, item){
        if(i === activeScreen["social_preset"]){
            socialData = item;
        }
    });
    
    initApp();
    
    function initApp(){
        if(storedScreen["title"]) activeScreen["title"] = storedScreen["title"];
        if(storedScreen["secondary"]) activeScreen["secondary"] = storedScreen["secondary"];
        if(storedScreen["social_preset"]) activeScreen["social_preset"] = storedScreen["social_preset"];
        if(storedScreen["volume"]) activeScreen["volume"] = storedScreen["volume"];
        
        // load data in
        $("html head").find("title").text(activeScreen["title"]);
        $("[data-line-one-copy]").text(activeScreen["title"]);
        $("[data-line-two-copy]").text(activeScreen["secondary"]);
        $("[data-volume-control]").attr("volume", activeScreen["volume"]);
        
        getTheme();
    }
    
    function getTheme(){
        $("#sidebar-bg").attr("data-colour", activeScreen["theme_primary"]);
        //$("#tint-bg").attr("data-colour", activeScreen["theme_secondary"]);
        $("#leading-text-bg").attr("data-colour", activeScreen["theme_secondary"]);
        $(".top-line").attr("data-colour", activeScreen["theme_secondary"]);
        $(".primary-colour-text").attr("data-colour", activeScreen["theme_secondary"]);
        $(".primary-colour-bg").attr("data-colour", activeScreen["theme_secondary"]);
        
        setTheme($("#sidebar-bg"));
        setTheme($("#leading-text-bg"));
        //setThemeEach($("#social .top-line"), "color");
        setThemeEach($("#social .primary-colour-text"), "color");
        
        $.each(appData.social_preset, function(i, presetItem){
            if(presetItem.id === activeScreen["social_preset"]){
                $("#settings-socialpreset").append("<option value=\""+ presetItem.id+"\" selected=\"selected\">"+presetItem.title+"</option>");
            } else {
                $("#settings-socialpreset").append("<option value=\""+ presetItem.id+"\">"+presetItem.title+"</option>");
            }
        });
    }
    
    function setTheme(target, targetAttr = "background"){
        $(target).css(targetAttr, $(target).attr("data-colour"));
    }
    
    function setThemeEach(target, targetAttr = "background"){
        $.each(target, function(i, item){
            $(target).css(targetAttr, $(target).attr("data-colour"));
        });
    }
    
    getSocial();
    
    function getSocial(){
        
        $.each(socialData, function(i, item){
            if(i <= 3){
                $("#coverLeft-social ul").append('\n\
                    <li>\n\
                        <div class="left">\n\
                            <i class="fab fa-'+item.icon+'"></i>\n\
                        </div>\n\
        \n\
                        <div class="right">\n\
                            <span class="top-line">'+item.line_one+'</span>\n\
                            <span class="bottom-line">'+item.line_two+'</span>\n\
                        </div> \n\
                    </li>   \n\
                ');
            }
        });
        
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
    });
    
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
        $("#settings-title").val(activeScreen["title"]);
        $("#settings-secondary").val(activeScreen["secondary"]);
        $("#settings-socialpreset").val(activeScreen["social_preset"]);
        $("#settings-showvideo").val(activeScreen["theme_show_video"]);
        $("#settings-showchairhinki").val(activeScreen["theme_show_chairhinki"]);
        
        // save this til last in the the load up
        $("select").customSelect();
    }
    
    function applyChangesRestart(writeCookies = false){
        var filteredSocialPreset = "default";
        var filteredTheme = "default";
        var filteredShowVideo = "yes";
        var filteredShowChairhinki = "yes";
        
        if(writeCookies){
            if($("#settings-socialpreset").val() !== null) filteredSocialPreset = $("#settings-socialpreset").val();
            if($("#settings-showvideo").val() !== "Select video visibility option") filteredShowVideo = $("#settings-showvideo").val();
            if($("#settings-volume").val() !== null) filteredVolume = $("#settings-volume").val();
            if($("#settings-showchairhinki").val() !== null) filteredShowChairhinki = $("#settings-showchairhinki").val();
            resetCookies();
            
            setCookie("intermission_leading_"+ filename, $("#settings-leading").val());
            setCookie("intermission_cta_"+ filename, $("#settings-cta").val());
            setCookie("intermission_volume_"+ filename, $("#settings-volume").val());
            setCookie("intermission_socialpreset_"+ filename, $("#settings-socialpreset").val());
            setCookie("intermission_showvideo_"+ filename, filteredShowVideo);
            setCookie("intermission_volume_"+ filename, $("#settings-volume").val());
            setCookie("intermission_showchairhinki_"+ filename, filteredShowChairhinki);
        }
        
        toggleSettings();
        restart();
    }
    
    function restart(){
        window.location.reload();
    }
    
});

/**
 * Provide .reverse() for usage in scripts
 */
jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse());
};

function _extends(){return(_extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source)Object.prototype.hasOwnProperty.call(source,key)&&(target[key]=source[key])}return target}).apply(this,arguments)}var CustomSelect=function($){var defaults={block:"custom-select",hideCallback:!1,includeValue:!1,keyboard:!0,modifier:!1,placeholder:!1,search:!1,showCallback:!1,transition:0},CustomSelect=function(){function CustomSelect(select,options){this._$select=$(select),this._options=_extends({},defaults,"object"==typeof options?options:{}),this._activeModifier=this._options.block+"--active",this._dropupModifier=this._options.block+"--dropup",this._optionSelectedModifier=this._options.block+"__option--selected",this._keydown=this._keydown.bind(this),this._dropup=this._dropup.bind(this),this._outside=this._outside.bind(this),this._init()}var _proto=CustomSelect.prototype;return _proto.reset=function(){this._$dropdown.hide().empty(),this._$value.off("click"),this._fill()},_proto._init=function(){this._$element=$('<div class="'+this._options.block+'">\n           <button class="'+this._options.block+"__option "+this._options.block+'__option--value" type="button"></button>\n           <div class="'+this._options.block+'__dropdown" style="display: none;"></div>\n         </div>'),this._$select.hide().after(this._$element),this._options.modifier&&this._$element.addClass(this._options.modifier),this._$value=this._$element.find("."+this._options.block+"__option--value"),this._$dropdown=this._$element.find("."+this._options.block+"__dropdown"),this._fill()},_proto._fill=function(){var _this=this;this._$values=this._$select.find("option"),this._values=[];var placeholder=this._options.placeholder;$.each(this._$values,function(i,option){var el=$(option).text().trim();_this._values.push(el)}),placeholder&&(this._$select.find("[selected]").length?placeholder=!1:(this._$value.html(placeholder),this._$select.prop("selectedIndex",-1))),$.each(this._values,function(i,el){var cssClass=_this._$values.eq(i).attr("class"),$option=$('<button class="'+_this._options.block+'__option" type="button">'+el+"</button>"),$selected=_this._$select.find(":selected");_this._$values.eq(i).attr("disabled")&&$option.prop("disabled",!0),!$selected.length&&0===i||el===$selected.text().trim()?(placeholder||_this._$value.text(el).removeClass(_this._$value.data("class")).removeData("class").addClass(cssClass).data("class",cssClass),(_this._options.includeValue||placeholder)&&($option.addClass(cssClass),$option.toggleClass(_this._optionSelectedModifier,_this._$values.eq(i).is("[selected]")),_this._$dropdown.append($option))):($option.addClass(cssClass),_this._$dropdown.append($option))}),this._$options=this._$dropdown.find("."+this._options.block+"__option"),this._options.search&&this._search(),this._$value.one("click",function(event){_this._show(event)}),this._$options.length||this._$value.prop("disabled",!0),this._$options.on("click",function(event){_this._select(event)})},_proto._show=function(event){var _this2=this;event.preventDefault(),this._dropup(),$(window).on("resize scroll",this._dropup),this._$element.addClass(this._activeModifier),this._$dropdown.slideDown(this._options.transition,function(){_this2._options.search&&(_this2._$input.focus(),_this2._options.includeValue&&_this2._scroll()),"function"==typeof _this2._options.showCallback&&_this2._options.showCallback.call(_this2._$element[0])}),setTimeout(function(){$(document).on("touchstart click",_this2._outside)},0),this._$value.one("click",function(event){event.preventDefault(),_this2._hide()}),this._options.keyboard&&(this._options.index=-1,$(window).on("keydown",this._keydown))},_proto._hide=function(){var _this3=this;this._options.search&&(this._$input.val("").blur(),this._$options.show(),this._$wrap.scrollTop(0)),this._$dropdown.slideUp(this._options.transition,function(){_this3._$element.removeClass(_this3._activeModifier).removeClass(_this3._dropupModifier),"function"==typeof _this3._options.hideCallback&&_this3._options.hideCallback.call(_this3._$element[0]),_this3._$value.off("click").one("click",function(event){_this3._show(event)}),$(document).off("touchstart click",_this3._outside),$(window).off("resize scroll",_this3._dropup)}),this._options.keyboard&&(this._$options.blur(),$(window).off("keydown",this._keydown))},_proto._scroll=function(){var _this4=this;$.each(this._$options,function(i,option){var $option=$(option);if($option.text()===_this4._$value.text()){var top=$option.position().top,center=_this4._$wrap.outerHeight()/2-$option.outerHeight()/2;return center<top&&_this4._$wrap.scrollTop(top-center),!1}})},_proto._select=function(event){var _this5=this;event.preventDefault();var choice=$(event.currentTarget).text().trim(),values=this._values.concat();if(this._$value.text(choice).removeClass(this._$value.data("class")),this._$values.prop("selected",!1),$.each(values,function(i,el){_this5._options.includeValue||el!==choice||values.splice(i,1),$.each(_this5._$values,function(i,option){var $option=$(option);if($option.text().trim()===choice){var cssClass=$option.attr("class");$option.prop("selected",!0),_this5._$value.addClass(cssClass).data("class",cssClass)}})}),this._hide(),this._options.includeValue)this._$options.removeClass(this._optionSelectedModifier),$.each(this._$options,function(i,option){var $option=$(option);if($option.text().trim()===choice)return $option.addClass(_this5._optionSelectedModifier),!1});else{if(this._$options.length>values.length){var last=this._$options.eq(values.length);last.remove(),this._$options=this._$options.not(last),this._$options.length||this._$value.prop("disabled",!0)}$.each(this._$options,function(i,option){var $option=$(option);$option.text(values[i]),$option.attr("class",_this5._options.block+"__option"),$.each(_this5._$values,function(){var $this=$(this);$this.text().trim()===values[i]&&$option.addClass($this.attr("class"))})})}void 0!==event.originalEvent&&this._$select.trigger("change")},_proto._search=function(){var _this6=this;this._$input=$('<input class="'+this._options.block+'__input" autocomplete="off">'),this._$dropdown.prepend(this._$input),this._$options.wrapAll('<div class="'+this._options.block+'__option-wrap"></div>'),this._$wrap=this._$element.find("."+this._options.block+"__option-wrap"),this._$input.on("focus",function(){_this6._options.index=-1}),this._$input.on("keyup",function(){var query=_this6._$input.val().trim();query.length?(_this6._$wrap.scrollTop(0),setTimeout(function(){query===_this6._$input.val().trim()&&$.each(_this6._$options,function(i,option){var $option=$(option),match=-1!==$option.text().trim().toLowerCase().indexOf(query.toLowerCase());$option.toggle(match)})},300)):_this6._$options.show()})},_proto._dropup=function(){var bottom=this._$element[0].getBoundingClientRect().bottom,up=$(window).height()-bottom<this._$dropdown.height();this._$element.toggleClass(this._dropupModifier,up)},_proto._outside=function(event){var $target=$(event.target);$target.parents().is(this._$element)||$target.is(this._$element)||this._hide()},_proto._keydown=function(event){var $visible=this._$options.filter(":visible").not("[disabled]");switch(event.keyCode){case 40:event.preventDefault(),$visible.eq(this._options.index+1).length?this._options.index+=1:this._options.index=0,$visible.eq(this._options.index).focus();break;case 38:event.preventDefault(),$visible.eq(this._options.index-1).length&&0<=this._options.index-1?this._options.index-=1:this._options.index=$visible.length-1,$visible.eq(this._options.index).focus();break;case 13:case 32:if(!this._$input||!this._$input.is(":focus")){event.preventDefault();var $option=this._$options.add(this._$value).filter(":focus");$option.trigger("click"),$option.is(this._$value)||this._$select.trigger("change"),this._$value.focus()}break;case 27:event.preventDefault(),this._hide(),this._$value.focus()}},CustomSelect._jQueryPlugin=function(config){return this.each(function(){var $this=$(this),data=$this.data("custom-select");data?"reset"===config&&data.reset():"string"!=typeof config&&(data=new CustomSelect(this,config),$this.data("custom-select",data))})},CustomSelect}();return $.fn.customSelect=CustomSelect._jQueryPlugin,$.fn.customSelect.noConflict=function(){return $.fn.customSelect},CustomSelect}($);
