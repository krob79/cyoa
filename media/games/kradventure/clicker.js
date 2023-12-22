//console.log("-----CLICKER CODE");
const clicker = {
	speed: 5, //how many pixels the marker moves each interval
    moveInterval: 15, //the timing for the setInterval
	leftBoundary: 0,
	rightBoundary: 400,
	midpoint: {}, //will be calculated
	attemptsAllowed: 3, //how many times is the player allowed to try?
	successesRequired: 1, //how many times does the player need to get it right?
	successPerc: undefined, //what percentage determines a success?
    successNode: '0',
    defaultNode: '0',
    winningPerc: '', //the value that will be used
    storedSuccess: [],
	attemptBoxes: [], //where the success/fail images will go
	//successZones:[{perc:0, color:'black'},{perc:15, color:'green'}, {perc:55, color:'yellow'}, {perc:95, color:'orange'}, {perc:100, color:'red'}],
	successZones:[],
	currentPosition: 0, //position of marker as it moves left and right
	currentAttempt: 1,
	successCount: 0,
    options: {},//outside object that will determine the settings for the clicker
    result: {},
    rounds:[],//where the various options will go
    currentRound: 0,
	prevCount: -1,
	clickerInterval: {},
	marker: {},
	clickbox: {},
    clickerbutton:{},
    clickerlink: {},
    element: {},
	displaybox: {},
	isMoving: false,
	init: function(elementID, options){
        console.log("CLICKER INIT");
        //var link = document.getElementById("clickerlink");
        //console.log(`---initiating clicker! options: ${options}`);
        this.rounds = [];
        //store each set of options as a separate round
        for(let i=0; i<options.length; i++){
            this.rounds.push(options[i]);
        }
        
		this.clickbox = document.createElement('div');
		this.clickbox.classList.add('clickbox');
        this.clickbox.classList.add('transient');
		this.marker = document.createElement('div');
		this.marker.classList.add('marker');
		this.displaybox = document.createElement('div');
		this.displaybox.classList.add('displaybox');
		this.clickbox.appendChild(this.marker);
		this.clickbox.appendChild(this.displaybox);
		
        this.element = document.getElementById(elementID);
		this.element.appendChild(this.clickbox);
		
        //the outer hotspot that covers the <A> tag
        this.clickerbutton = document.getElementById('click_outer');
        //how does bind work again...?
		this.clickerbutton.addEventListener("click", this.toggleClick.bind(this));
        //the <A> tag itself
        this.clickerlink = document.getElementById("clickerlink");
        this.switchClickSpots("outer");
		this.startRound(0);
		
	},
    startRound: function(round=0){
        //{evtname:'promptevent', detail:{promptType:'clicker', action:'create', promptText:'ATTACK!', objString: [{attemptsAllowed:1, successesRequired:1, successPerc:45, successNode:'6110', defaultNode:'6001'}]}}
        this.currentAttempt = 1;
        this.storedSuccess = [];
        this.zones = [];
        this.successPerc = undefined;
        let successColor = '#030';
        let otherColor = '#900';
        this.successZones = [];
        let otherZones = [];
        let mergedZones = [];
        
        this.options = this.rounds[round];
        let keys = Object.keys(this.options);
        //console.log(`START CLICKER ROUND ${round}`);
        keys.forEach((key, index) => {
            this[key] = this.options[key];
            //console.log(`CLICKER SETTINGS FOUND - ${key}: ${this[key]}`);
        });
        
        
        
        
        
        if(this.successPerc){
           //console.log("---SUCCESS PERC DETECTED - WE WILL DO CENTERING!");
            //since we're doing a percentage, it's always going to be x/100, x is start, 100 is always the end
            //to center it, we're taking half of the start point (x/2) and half of the end point (100/2 = 50)
            //that brings half of the amount to the left of the middle
            let leftHalf = this.successPerc/2;
            //then we add the same amount to the right of the middle; (rightHalf - leftHalf) should equal (100 - successPerc).
            let rightHalf = 50 + (50-leftHalf);
            this.successZones.push({start:leftHalf, end:rightHalf, color:successColor});
        }else{
            //console.log("---NO SUCCESS PERC DETECTED - WE WILL DO LINEAR!");

            //this.zones comes from the objString - all of the code below deals with user-defined successZones
            //push in all of the actual zones we want to check for when the user clicks
            for(var i=0; i<this.zones.length; i++){
                this.successZones.push({start:this.zones[i].start, end:this.zones[i].end, color:successColor});
                this.storedSuccess.push(false);
            }
        }

        //push in the VERY FIRST region - from 0 to right before the first zone
        otherZones.push({start:0, end:this.successZones[0].start-0.1, color:otherColor}); 
        //push in the VERY LAST region - from right after the last zone to 100
        otherZones.push({start:this.successZones[this.successZones.length-1].end+0.1, end:100, color:otherColor}); 
        //push in any regions INBETWEEN the zones we're checking for - always 1 less than the number of these zones 
        for(var j=1; j<this.successZones.length; j++){
            otherZones.push({start:this.successZones[j-1].end+0.1, end:this.successZones[j].start-0.1, color:otherColor}); 
        }
        mergedZones = [...this.successZones, ...otherZones];
        mergedZones.sort((a,b) => {
            if ( a.start < b.start ){
                return -1;
            }
            if ( a.start > b.start ){
            return 1;
            }
            return 0;
        });

        //color in regions
        this.colorLinear(mergedZones);
        
        //clear out any previous attemptBoxes
        var attemptBox = document.querySelector('.attempt');
        //remove everything in the container 1 by 1
        while(this.displaybox.childNodes.length > 0){
              //console.log("REMOVING CHILD");
              this.displaybox.removeChild(attemptBox.firstChild);
        }
        this.attemptBoxes = [];
        
        //create new attemptBoxes for where success/fail icons go for each attempt
		for(var i=0; i<this.attemptsAllowed;i++){
			var box = document.createElement("div");
			box.classList.add('attempt');
			this.displaybox.appendChild(box);
			this.attemptBoxes.push(box);
		}
        this.start();
        
    },
	start: function(){
		//console.log(`ATTEMPT: ${this.currentAttempt}/${this.attemptsAllowed} SUCCESSES: ${this.successCount}/${this.successesRequired} `);
		this.isMoving = true;
		this.currentPosition = Math.floor(Math.random() * (this.rightBoundary-this.leftBoundary + 1) + this.leftBoundary);
		this.midpoint = (this.rightBoundary-this.leftBoundary)/2;
		this.clickerInterval = setInterval(this.move.bind(this), this.moveInterval);
        //console.log("---SET INTERVAL: " + this.clickerInterval);
        
        if(this.currentAttempt == this.attemptsAllowed){
            /*
            This is the crucial feature here! If the current attempt is one before the last, hide the clicker button. This will let the last toggleClick command be called from the <a> tag that wraps the clicker. The click from the <a> tag should behave like any other NodeChoice link and fire code, but also transition to the next Situation (convob). Once the clicker results are in, the appropriate Node will be set up to load, based on success or fail. 
            */
            this.switchClickSpots();
        }
	},
	stop: function(){
		this.isMoving = false;
		var diff = Math.abs(this.currentPosition - this.midpoint);
		var perc = ((this.midpoint - diff)/this.midpoint)*100;
        //console.log("---CLEAR INTERVAL: " + this.clickerInterval);
		clearInterval(this.clickerInterval);
		//console.log(`${this.currentPosition} - diff from center: ${diff} - ${perc}%`);
        this.checkZone(perc);
        
	},
    checkZone:function(perc){
		let pos = (this.currentPosition/this.rightBoundary)*100;
        
		let zones = this.successZones;
        let success = false;
        
        
            //otherwise, there must be multiple zoes, so run through each of them to check
            //NOTE: we need to tweak this - for simple successPerc value checks, additional successes beyond the required amount should be considered good; however, with multiple successZones, clicking all the right zones should be good, but clicking them extra isn't good...
            for(let i=0; i<this.successZones.length; i++){
                if(pos >= this.successZones[i].start && pos <= this.successZones[i].end){ 
                   if(!this.storedSuccess[i]){
                       //console.log(`----${pos} ZONE? ${this.successZones[i].start} - ${this.successZones[i].end} - YES`);
                      this.storedSuccess[i] = true;
                      this.winningPerc = perc;
                      success = true;
                   }else{
                       console.log(`----${pos} ZONE? ${this.successZones[i].start} - ${this.successZones[i].end} - ALREADY BEEN HERE`);
                   }
                   
                }else{
                    //console.log(`----${pos} ZONE? ${this.successZones[i].start} - ${this.successZones[i].end} - NO`); 
                }
            }
        
        if(success){
            this.successCount++;
            //subtract 1, because it references arrays and while currentAttempt will start at 1, the array starts at 0.
            this.cueResult(this.currentAttempt-1, 'success', pos, perc);
        }else{
            this.cueResult(this.currentAttempt-1, 'fail', pos, perc);
        }
        
	},
	move: function(){
		var tempCount = this.currentPosition;
		if(this.prevCount < this.currentPosition){
			
			this.currentPosition += this.speed;
			if(this.currentPosition > this.rightBoundary){
			   //console.log(`---RIGHT BOUNDARY: ${this.rightBoundary}`);
			   this.currentPosition = this.rightBoundary - (this.currentPosition - this.rightBoundary);
			   tempCount = this.rightBoundary;
			}
		}else{
			this.currentPosition -= this.speed;
			if(this.currentPosition < this.leftBoundary){
				//console.log(`---LEFT BOUNDARY: ${this.leftBoundary}`);
				this.currentPosition = this.leftBoundary + (this.leftBoundary - this.currentPosition);
				tempCount = this.leftBoundary;
			}
		}
		//console.log(`${this.currentPosition}`);
		this.marker.style.left = `${(this.currentPosition/this.rightBoundary)*100}%`;
		this.prevCount = tempCount;
	},
    toggleClick: function(){
        if(this.isMoving){
            this.stop();
        }
        //console.log("---CLICKING BUT ALREADY STOPPED: " + this.clickerInterval);
        return false;
    },
    switchClickSpots: function(type){
        if(type == 'outer'){
           //console.log("Hiding Inner Clickspot, showing Outer");
           this.clickerbutton.style.display = 'block';
           this.clickerlink.style.display = 'none';
        }else{
            //console.log("Hiding Outer Clickspot, showing Inner");
            this.clickerbutton.style.display = 'none';
            this.clickerlink.style.display = 'block';
        }
    },
	cueResult: function(num, result, pos, perc){
        //console.log(`---SETTING RESULT ${num} - ${this.attemptBoxes[num]}`);
		this.attemptBoxes[num].style.backgroundImage = `url('${imgpath}${result}.png')`;
		this.attemptBoxes[num].style.border = '2px solid rgba(255,255,255,.5)';
        let content = document.getElementById("content");
        
        if(this.currentAttempt < this.attemptsAllowed){
            this.currentAttempt++;
            setTimeout(()=>{
                //console.log("---restarting marker animation");
                this.start();
            }, 1000); 
            return;
        }else if(this.successCount >= this.successesRequired){
            this.result = {pass:true, value:this.winningPerc, node:this.successNode};
            this.resolve();
        }else{
            this.result = {pass:false, value:perc, node:this.defaultNode};
            this.resolve();
        }
        content.dispatchEvent(new CustomEvent('clickerlink', { detail: {pass:this.result.pass, value:(this.result.value/100), node:this.result.node} }));
        
	},
    colorLinear:function(mergedZones){
        //console.log("--------COLORLINEAR");
        let gradientTxt = "";
        
        //this doesn't need to be here, other than for testing
        this.mergedZones = mergedZones;
        
        //gradientTxt += `'linear-gradient(to right,${this.successZones[0].color},`;
		gradientTxt += mergedZones[0].color + ",";
		for(var i=1; i<mergedZones.length-1;i++){
            gradientTxt += `${mergedZones[i-1].color} ${mergedZones[i].start}%,`;
			gradientTxt += `${mergedZones[i].color} ${mergedZones[i].start}%,`;
            //console.log(`------gradient: linear-gradient(to right,${gradientTxt})`);
		}
		gradientTxt += `${mergedZones[mergedZones.length-2].color} ${mergedZones[mergedZones.length-1].start}%,`;
        gradientTxt += `${mergedZones[mergedZones.length-1].color} ${mergedZones[mergedZones.length-1].start}%`;
        //console.log(`------END gradient: linear-gradient(to right,${gradientTxt})`);
		
		//console.log("Gradient Text: " + gradientTxt.trim());
		
		//Example of output: this.clickbox.style.background = 'linear-gradient(to right,black,green 12.5%,orange 37.5%,orange 47.5%,red 50%,orange 52.5%,orange 62.5%,green 87.5%,black)';
		//console.log("Background Text: " + this.clickbox.style.background);
		this.clickbox.style.background = 'linear-gradient(to right,' + gradientTxt +')';
    },
	colorCenter:function(){
		/*
        This function will create a linear gradient and define all colors/zones from left (0%) to right (100%). However, the "100% zone" will always be in the center, and will be symmetrical, meaning the zones will go from left (0%) to center (100%) to right (0%).
        So, to share the same space, the distance between each zone is halved, then added again after the 100% zone.
        For example if the defined zones were: 
        A -> B -> C -> D
        it would need to be converted to: 
        (1/2)A -> (1/2)B -> (1/2)C -> (1/2)D -> (1/2)C -> (1/2)B -> (1/2)A
        */
		let diffs = [];
		let colors = [];
		let mergedDiffs = [];
		let mergedColors = [];
		
		let gradientTxt = "";
		let currentPerc = 0;
        
        //successPerc
        //{perc:0, color:'#900'},{perc:79, color:'#900'},{perc:80, color:'#030'}, {perc:100, color:'#030'}
		
		//there's always going to be one less diff than there are zones. so, just add the first color from the zones to the array
		colors.push(this.successZones[0].color);
		/*
		then, starting with the second (index 1) zone in the array, calculate diffs between the current zone and
		the previous zone and add them to the diffs array, while also adding the color from the current zone 
		to the colors array
		*/
		for(let i=1; i<this.successZones.length; i++){
			let diff = (this.successZones[i].start - this.successZones[i-1].start)/2;
			diffs.push(diff);
			colors.push(this.successZones[i].color);
		}
		//copy the array of diffs, flip the order, then put both arrays together in a new array that's now symmetrical
		let reversedDiffs = [...diffs].reverse();
		mergedDiffs = [...diffs, ...reversedDiffs];
		
        //what exactly does 'chunk' do again?
		let reversedColors = [...colors].reverse();
		let chunk = colors.pop();
		mergedColors = [...colors, ...reversedColors];
		chunk = mergedColors.shift();
		
		//console.log(`Merged: ${[...mergedDiffs, ...mergedColors]}`);
		
		//gradientTxt += `'linear-gradient(to right,${this.successZones[0].color},`;
		gradientTxt += this.successZones[0].color + ",";
		for(var i=0; i<mergedColors.length-1;i++){
			currentPerc += mergedDiffs[i];
			gradientTxt += `${mergedColors[i]} ${currentPerc}%,`;
		}
		gradientTxt += `${mergedColors[i]}`;
		
		//console.log("Gradient Text: " + gradientTxt.trim());
		
		//Example of output: this.clickbox.style.background = 'linear-gradient(to right,black,green 12.5%,orange 37.5%,orange 47.5%,red 50%,orange 52.5%,orange 62.5%,green 87.5%,black)';
		//console.log("Background Text: " + this.clickbox.style.background);
		this.clickbox.style.background = 'linear-gradient(to right,' + gradientTxt +')';
		
	},
    //this function clears out divs in the clicker container, removes eventListeners, intervals
    resolve: function(){
        
        this.clickerbutton.removeEventListener("click", this.toggleClick.bind(this));
        //console.log(`OBJECT ON RESOLVE: ${result.pass} and ${result.value}`);
        //console.log("---CLEAR INTERVAL FOR GOOD: " + this.clickerInterval);
        clearInterval(this.clickerInterval);
        
        setTimeout(()=>{
            var clickercontainer = document.querySelectorAll('.clickercontainer')[0];
            //remove everything in the container 1 by 1
            while(clickercontainer.firstChild){
                  //console.log("REMOVING CHILD");
                  clickercontainer.removeChild(clickercontainer.firstChild);
            }
            //clear the class so we don't leave behind duplicates
            clickercontainer.classList.remove('clickercontainer');
            this.element.removeChild(this.clickbox);
        }, 1000); 
    }
	
}// JavaScript Document

//let container = document.querySelector(".container");
//clicker.init(container);