/**
 * Supporter Drive
 */


$(function(){
    var current_goal = 0, logoQueue = [], tiersData, tiersQueue = [], tiersTimer = 0, helper__minute = 60000, helper__second = 1000;
    
    setTimeout(function(){
        startLogo();
    }, 2500);
    
    function startLogo(){
        $(".logoQueueItem").each(function(i){
            logoQueue.push($(this));
        });
        
        $.each(logoQueue, function(i, item){
            if(i === 0){
                $(this).addClass("active");
            } else {
                var cachedThis = $(this);
                setTimeout(function(){
                    cachedThis.addClass("active");
                }, 240*i);
            }
        });

        setTimeout(function(){
            endLogo();
        }, 0.1 * helper__minute);
    }
    
    function endLogo(){
        var Queue = logoQueue.reverse();
        
        $.each(Queue, function(i, item){
            if(i === 0){
                $(this).removeClass("active");
            } else {
                var cachedThis = $(this);
                setTimeout(function(){
                    cachedThis.removeClass("active");
                }, 240*i);
            }
        });
        
        // reset the tiers
        $("#supporter-drive-tiers ul").empty();
        
        setTimeout(function(){
            startTiers();
        }, 0.6 * helper__second);
    }
    // Check Tier Unlock Status
    function checkTierGoal(unlock = 0){
        if(current_goal >= unlock) return true;
        return false;
    }
    
    function startTiers(){
        // get current total
        current_goal = getCookie("supporters_overlay_current");
        
        // get data
        $.ajax({
            url: "/app/data/supporter-drive-tiers.json",
            async: false,
            dataType: "json",
            contentType: "application/json",
            success: function(data){
                tiersData = data;
            }
        });
        
        $.each(tiersData, function(i, obj){
            if(obj.active === true){
                tiersQueue.push({
                    "title": obj.title,
                    "unlock": obj.unlock,
                    "goal_met": checkTierGoal(obj.unlock),
                    "asset": obj.asset
                });
                tiersTimer += 11;
            }
        });
        
        $.each(tiersQueue, function(i, item){
            if(item.goal_met === true){
                var unlockTemplate = "Tier reached ("+ item.unlock +" Supporters)";
            } else {
                var unlockTemplate = current_goal +"/"+ item.unlock +" Supporters";
            }
            
            $("#supporter-drive-tiers ul").append('\n\
            <li class="supporter-drive-tiers-item">\n\
                <div class="tier-asset">\n\
                    <div class="tier-asset-inner"><img src="'+ item.asset +'"></div>\n\
                </div>\n\
                \n\
                <div class="tier-info">\n\
                    <div class="tier-info-container">\n\
                        <div class="tier-info-inner">\n\
                            <div class="tier-title">'+ item.title +'</div>\n\
                            <div class="tier-goal">'+ unlockTemplate +'</div>\n\
                        </div>\n\
                    </div>\n\
                </div>\n\
            </li>');
        });
        
        setTimeout(function(){
            $("#supporter-drive-tiers ul li:first-child").addClass("active");
            setTimeout(function(){
                toggleTiers();
            }, 10 * helper__second);
        }, 1000);
    }
    
    function toggleTiers(){
        if($("#supporter-drive-tiers ul li:last-child").hasClass("active")){
            $("#supporter-drive-tiers ul li.active").removeClass("active");
            endTiers();
        } else {
            $('#supporter-drive-tiers ul li.active').next().addClass("active");
            $("#supporter-drive-tiers ul li.active").first().removeClass("active");
            
            setTimeout(function(){
                toggleTiers();
            }, 10 * helper__second);
        }
    }
    
    function endTiers(){
        var tiersTimer = 0;
        logoQueue = [];
        tiersQueue = [];
        
        setTimeout(function(){
            startLogo();
        }, 2 * 1000);
    }
    
});

/**
 * Provide .reverse() for usage in scripts
 */
jQuery.fn.reverse = function() {
    return this.pushStack(this.get().reverse());
};