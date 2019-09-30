var second = 1000;
var minute = 60000;
var testMode = false;
var duration;

// divs to animate
var ribbonDiv = document.getElementById("animate-object-1");
var usernameDiv = document.getElementById("animate-object-2");
var amountDiv = document.getElementById("animate-object-3");

EstablishDurationSettings();
Rundown();

function EstablishDurationSettings(){
    switch(alertType){
        case "stars":
        case "resub":
        case "sub":
            duration = 9;
            break;
        case "follow":
            duration = 4;
            break;
        default:
            duration = 6;
            break;
    }
}

function Rundown(){
    TransitionIn();
    
    setTimeout(function(){
        TransitionOut();
    }, duration * second);
}

function TransitionIn(){
    // ribbon
    ribbonDiv.classList.add("active");

    setTimeout(function(){
        usernameDiv.classList.add("active");

        setTimeout(function(){
            amountDiv.classList.add("active");
        }, 0.25 * second);
    }, 0.5 * second);
}

function TransitionOut(){
    amountDiv.classList.remove("active");
    amountDiv.classList.add("transout");

    setTimeout(function(){
        usernameDiv.classList.remove("active");
        usernameDiv.classList.add("transout");

        setTimeout(function(){
            ribbonDiv.classList.remove("active");
            ribbonDiv.classList.add("transout");

            setTimeout(function(){
                ribbonDiv.classList.remove("transout");
                usernameDiv.classList.remove("transout");
                amountDiv.classList.remove("transout");
                if(testMode) Rundown();
            }, 1 * second);
        }, 0.25 * second);
    }, 0.25 * second);
}

