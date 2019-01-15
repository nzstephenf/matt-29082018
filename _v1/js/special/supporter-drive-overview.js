/**
 * Overview
 */

$(function(){
    startAnimation()
    function startAnimation(){
        $("#header").addClass("active");
        setTimeout(function(){
            $("#content").addClass("active");
            
            setTimeout(function(){
           //     endAnimation();
            }, 1100);
        }, 1 * 1000);
    }
    
    function endAnimation(){
        setTimeout(function(){
            $("#header").toggleClass("active end-animation");

            setTimeout(function(){
                $("#header").removeClass("end-animation");
                $("#content").toggleClass("active end-animation");

                setTimeout(function(){
                    $("#content").removeClass("end-animation");
                    setTimeout(function(){
                        startAnimation();
                    }, 4000);
                }, 1100);
            }, 1 * 1000);

        }, 1 * 1000);
    }
});

