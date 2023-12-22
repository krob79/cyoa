//look at https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/
//to build a better timer based on system clock
//THE BELOW CODE DOESN'T WORK YET, CURRENTLY BASING IT ON CSS ANIMATION DURATION
//BECAUSE OF THAT, NOT EVEN SURE YET HOW WELL IT WILL WORK ON MOBILE
const timer = {
    interval: {},
    init: function(seconds, timerEventName, divName = 'content'){
        let circle = document.createElement('div');
        circle.classList.add('circle');
        let circle_half = document.createElement('div');
        circle_half.classList.add('circle__half');
        let circle_half_right = document.createElement('div');
        circle_half_right.classList.add('circle__half'); 
        circle_half_right.classList.add('circle__half--right');
        let circle_bg = document.createElement('div');
        circle_bg.classList.add('circle__bg');

        circle.appendChild(circle_half);
        circle.appendChild(circle_half_right);
        circle.appendChild(circle_bg);
        document.querySelector(`#${divName}`).appendChild(circle);

        circle_half.style.setProperty('--duration', `${seconds}s`);
        circle_half_right.style.setProperty('--duration', `${seconds}s`);
        console.log(`----setting timer to ${seconds}s`);

        setTimeout(function() {
            console.log("----TIMER DONE!!!");
            circle.parentNode.removeChild(circle);
            dispatchCustomEvent(timerEventName);
        }, (seconds*1000));
    },
    start: function(){
        this.interval = setInterval
    },
    stop: function(){
        
    },
    tick:function
}