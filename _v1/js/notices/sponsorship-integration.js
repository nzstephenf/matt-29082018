$(function(){
    var filedir = document.location.href;
    var filename = filedir.substr(filedir.lastIndexOf('/') + 1).replace(".html","");
    
    // create variables with default
    var theme_primary = "#499999";
    var theme_secondary = "#2c7f7f";
    
    var cookie_delay = getCookie("overlay_delay_"+ filename);
    var cookie_duration = getCookie("overlay_duration_"+ filename);
    
    var minuteHelper = (60 * 1000);
    var usedDelay = 10 * minuteHelper;
    
    // run animation in a loop. delayed 
    setTimeout(function(){
        $(".sponsor-watermark").addClass("active");
    }, 2000);

    setTimeout(function(){
        runAnimation();
    }, 8 * 1000);
    
    function runAnimation(){
        $(".sponsor-watermark").removeClass("active");
        
        setTimeout(function(){
            $(".sponsored-strand").addClass("active");
            nextActive(true, true);

            setTimeout(function(){
                nextActive(true);

                setTimeout(function(){
                    nextActive(true);

                    setTimeout(function(){
                        $(".sponsored-strand").removeClass("active");
                        nextActive();
                        
                        setTimeout(function(){
                            $(".sponsor-watermark").addClass("active");
                        }, 1300);
                        
                        setTimeout(function(){
                            runAnimation();
                        }, usedDelay);
                    }, 7 * 1000); // last slide
                }, 10 * 1000); // second slide
            }, 11 * 1000); // first slide
        }, 0.8 * 1000); // wait for watermark to transition off
    }
    
    function nextActive(continueActive = false, first = false){
        if(continueActive){
            if(first){
                $("#sponsorship-integration li:first").addClass("active");
            } else {
                $("#sponsorship-integration li.active").next().addClass("active");
            }
            // add class to make this easier
            $("#sponsorship-integration li.active:last").find(".top-bar-item").addClass("active");

            // add active to other items
            setTimeout(function(){
                $("#sponsorship-integration li.active:last").find(".bottom-bar-item").addClass("active");

                setTimeout(function(){
                    $("#sponsorship-integration li.active:last").find(".bottom-bar-content").addClass("active");
                }, 120);
            }, 500);
        }
        
        if(!first){
            $("#sponsorship-integration li.active:first").find(".bottom-bar-content").removeClass("active");

            setTimeout(function(){
                $("#sponsorship-integration li.active:first").find(".bottom-bar-item").removeClass("active");

                setTimeout(function(){
                    $("#sponsorship-integration li.active:first").find(".top-bar-item").removeClass("active");
                    $("#sponsorship-integration li.active:first").removeClass("active");
                }, 480);
            }, 120);
        }
    }
});