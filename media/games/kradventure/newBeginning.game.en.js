// ---------------------------------------------------------------------------
// Edit this file to define your game. It should have at least four
// sets of content: undum.game.situations, undum.game.start,
// undum.game.qualities, and undum.game.init.
// ---------------------------------------------------------------------------

/* A unique id for your game. This is never displayed. I use a UUID,
 * but you can use anything that is guaranteed unique (a URL you own,
 * or a variation on your email address, for example). */
undum.game.id = "349baf43-9ade-49a8-86d0-24e3de3ce072";

/* A string indicating what version of the game this is. Versions are
 * used to control saved-games. If you change the content of a game,
 * the saved games are unlikely to work. Changing this version number
 * prevents Undum from trying to load the saved-game and crashing. */
undum.game.version = "2.0";



//***Location Situation Objects***
/* The situations that the game can be in. Each has a unique ID. */
undum.game.situations = {
	start: new undum.SimpleSituation("<h1>MENU</h1><ul><li><a href='mapchoice'>New Game</a></li><li><a href='loadgame'>Load Game</a></li></ul>"),
    buildingenter: new undum.SimpleSituation("<p>Well, this is it. Not much, but the first step! For some reason, when naming a new instance of SimpleSituation, the code doesn't like underscores. Or uppercase. Very picky. So just use alphanumerics.</p>",{
            enter: function(character, system, action){
				system.doLink('enterrooma');
			}
        }
                        
    ),
    loadgame: new undum.SimpleSituation('',{
        enter: function(character, system, action){
            
            setObject(loaderBot);
            system.doLink('convosectiona');
        },
        actions:{
            "greet": function(character, system, action){
                system.doLink('convosectiona');
            }
        }
    
    }),
    mapchoice: new undum.SimpleSituation(``,{
        enter: function(character, system, action){
            try{
                stageManager.clearStyle();
            }catch(e){
                console.log("---NO STYLE");
            }
            travelManager.currentSubject = whodiddle;
            travelManager.currentLocation = whodiddle;
            //dispatchCustomEvent({evtname:'locationevent', detail:{action:"showmap", obj: "mapassist"}});
            system.doLink('convosectiona');
        }
    }),
    convosectiona: new undum.SimpleSituation(``,{
        enter: function(character, system, action){
            let currentSubject = travelManager.currentSubject;
            
            
            let imageMarkup = travelManager.currentImageMarkup;
            
            system.setCharacterText(`<p>You are at ${travelManager.currentLocation.title}</p>`);
            
            //if there is one, and combat is not happenning, display the question/comment previously chosen by the player HERE instead.
            //console.log("WHAT IS IN THIS DAMN TEXT? LENGTH? " + travelManager.currentText.length);
            if(travelManager.currentText.length != ''){
                //writeContent(`<p class='playerbox leftarrow transient'>${travelManager.currentText}</p>`);
                system.write(`<p class='playerbox leftarrow transient'>${travelManager.currentText}</p>`);
            }
            
            //console.log(`----Current Subject: ${travelManager.currentSubject.id} - ${travelManager.nodeToLoad}`);
            travelManager.currentNode = currentSubject.getNode(travelManager.nodeToLoad, travelManager);
            
            let result = travelManager.currentNode.obj.separateText();
            //replace any references to variables in the text. Ex: "Hi, my name is {name}!"
            let before = replaceBracketValues(result.before);
            let after = replaceBracketValues(result.after);
            
            //Write the text intended to display before the images
            if(before != ''){
               //writeContent(before);
               system.write(before);
            }
            
            //Write the image tags for the background image and character image, if available
            if(imageMarkup != ''){
               //writeContent(imageMarkup);
               system.write(imageMarkup);
            }
            
            //Write the text intended to display after the images
            if(after != ''){  
               //writeContent(`<p class='${currentSubject.textclass}'>${after}</p>`);    
               system.write(`<p class='${currentSubject.textclass}'>${after}</p>`);
            
                //RUN TEXT EFFECTS!!!
                //get the last word bubble element  
                let el = document.querySelectorAll('.characterbox');
                let lastEl = el[el.length-1];
                //make sure to run the effect on ONLY the last bubble, because the text effect code only works on the FIRST element if multiple elements are gathered.
                runTextEffect(lastEl);
            
            }
            
            //DISPLAY FILTERED CHOICES FROM NODE!
            //writeContent(travelManager.currentNode.choicetxt); 
            system.write(travelManager.currentNode.choicetxt); 
            
        }
    }),
    convosectionb: new undum.SimpleSituation(``,{
        enter: function(character, system, action){
            //there's really nothing here! Re-entering the "convoA" Situation allows the next node to load in! Weird, but not sure how else to code it at the moment.
            //console.log("****SECTION B****");
            system.doLink('convosectiona');
        }
    })
};

// ---------------------------------------------------------------------------
/* The Id of the starting situation. */
undum.game.start = "mapchoice";


let travelOptions = "<p class='transient'><ul class='options'><li><a class='once' href='mapchoice'>Check Travel Options?</a></li></ul></p>";

let yourName = "";
let textEffectSupported = false;

//this function attempts to duplicate everything within "convosectiona", but without the Undum code!
function writeNodeContent(travelManager, nodeID){
            let tm = travelManager;
            let nodeContent = "";
            let currentSubject = tm.currentSubject;
            let imageMarkup = tm.currentImageMarkup;
            let content = document.querySelector('#content');
            
            //system.setCharacterText(`<p>You are at ${tm.currentLocation.title}</p>`);
            nodeContent += `<h1>${tm.currentLocation.title}</h1>`;
            //nodeContent += `<p>${currentSubject.description}</p>`;
            
            //if there is one, and combat is not happenning, display the question/comment previously chosen by the player HERE instead.
            //console.log("WHAT IS IN THIS DAMN TEXT? LENGTH? " + tm.currentText.length);
            if(tm.currentText.length != ''){
                //writeContent(`<p class='playerbox leftarrow transient'>${tm.currentText}</p>`);
                nodeContent +=`<p class='playerbox leftarrow transient'>${tm.currentText}</p>`;
            }
            
            //console.log(`----Current Subject: ${tm.currentSubject.id} - ${tm.nodeToLoad}`);
            tm.currentNode = currentSubject.getNode(nodeID, tm);
            
            let result = tm.currentNode.obj.separateText();
            //replace any references to variables in the text. Ex: "Hi, my name is {name}!"
            let before = replaceBracketValues(result.before);
            let after = replaceBracketValues(result.after);
            
            //Write any text intended to display before the images
            if(before != ''){
               //writeContent(before);
               nodeContent += before;
            }
            
            //Write any image tags intended for the background image and character image, if available
            if(imageMarkup != ''){
               //writeContent(imageMarkup);
               nodeContent += imageMarkup;
            }
            
            //Write the text intended to display after the images, narration or in a word bubble
            if(after != ''){  
               //writeContent(`<p class='${currentSubject.textclass}'>${after}</p>`);    
               nodeContent +=`<p class='${currentSubject.textclass}'></p>`;
                //nodeContent +=`<p class='${currentSubject.textclass}'></p>`;
            }
            //DISPLAY FILTERED CHOICES FROM NODE!
            //writeContent(tm.currentNode.choicetxt); 
            nodeContent += `${tm.currentNode.choicetxt}`; 
            content.innerHTML = nodeContent;
            
                //RUN TEXT EFFECTS!!!
                //get the last word bubble element  
                let el = document.querySelectorAll('.characterbox');
                let lastEl = el[el.length-1];
                console.log(`---CHECKING THE 'lastEl' TEXT - ${after}`);
                //make sure to run the effect on ONLY the last bubble, because the text effect code only works on the FIRST element if multiple elements are gathered.
                try{
                    if(lastEl){
                       runTextEffect2(after);
                    }else{
                        nodeContent += after;
                    }
                    

                }catch(e){
                    console.log(`ERROR WITH TEXT EFFECTS! ${e}`);
                }
                
}


function resolveRPSCombat(playerchoice, characterchoice){
    //0 = rock, 1 = paper, 2 = scissors
    //function will return 1 for win, 0 for tie, -1 for loss 
    switch(playerchoice){
        case "rock":
            if(characterchoice == 0){
               return 0;
            }else if(characterchoice == 1){
               return -1;
            }else{
               return 1;    
            }
            break;
        case "paper":
            if(characterchoice == 0){
               return 1;
            }else if(characterchoice == 1){
               return 0;
            }else{
               return -1;    
            }
            break;
        case "scissors":
            if(characterchoice == 0){
               return -1;
            }else if(characterchoice == 1){
               return 1;
            }else{
               return 0;    
            }
            break;
    }
}

function adjustHealth(character, system, amount, desc){
	var descText;
	if(desc != null){
		descText = desc;
	}else{
		descText = "";
	}
    console.log("ADJUSTING HEALTH BY " + amount);
    character.qualities.health += amount;
    gameplayer.currentHealth = character.qualities.health;
    //if the player gets healed for more than their max amount, set health to max amount
	if(character.qualities.health > character.sandbox.totalHealth){
		character.qualities.health = character.sandbox.totalHealth;
	}
	var percBefore = character.qualities.health/character.sandbox.totalHealth;
	var percBeforeRounded = Math.round(percBefore*100)/100;
	var percAfter = (character.qualities.health+amount)/character.sandbox.totalHealth;
	var percAfterRounded = Math.round(percAfter*100)/100;
	//alert("Health percentage: " + percBeforeRounded +" "+percAfterRounded );
	system.animateQuality("health", (character.qualities.health+amount),{from:percBeforeRounded, to:percAfterRounded});
	
}

function adjustHealthBar(damage, element){
    let hpDisplay = document.querySelector(`#hpDisplay_${element}`);
    let hBar = document.querySelector(`#hpDisplay_${element} .health-bar`);
    let bar = document.querySelector(`#hpDisplay_${element} .bar`);//'#hBar > .bar' at some point?
    let hit = document.querySelector(`#hpDisplay_${element} .hit-${element}`);
    
    let total = hBar.dataset.total;
    let value = hBar.dataset.value;
    
    console.log("---BAR.STYLE.LEFT: " + bar.style.left);
    if(bar.style.left == ""){
       bar.style.left = 0;
    }
    
    
    if (value < 0) {
      value = 0;
      console.log("you dead, reset");
    }
    
    // max damage is essentially quarter of max life
    //var damage = Math.floor(Math.random()*total);
    // damage = 100;
    var newValue = value - damage;
    // calculate the percentage of the total width
    var barWidth = (newValue / total) * 100;
    var hitWidth = (damage / value) * 100 + "%";
    
    // show hit bar and set the width
    hit.style.width = hitWidth;
    if(element == "right"){
            //hit.style.left = (100-barWidth) + "%";
        }
    
    hBar.dataset.value = newValue;
    if(element == "right"){
            //bar.style.left = (100-barWidth) + "%";
    }
    
    setTimeout(function(){
         hit.style.width = '0';
         bar.style.width = barWidth + "%";
        if(element == "right"){
            bar.style.left = (100-barWidth) + "%";
        }
        
        
    }, 500);
    //bar.css('width', total - value);
    
    console.log(`value: ${value}, damage: ${damage}, hitWidth: ${hitWidth}`);
    
    if( value < 0){
      value = 0;
      console.log("DEAD");
    }
}

function checkHealth(character, system){
	if(character.qualities.health < 1){
		return false;
	}else{
		return true;
	}
}

// ---------------------------------------------------------------------------
/* Here we define all the qualities that our characters could
 * possess. We don't have to be exhaustive, but if we miss one out then
 * that quality will never show up in the character bar in the UI. */
undum.game.qualities = {
	health: new undum.IntegerQuality(
		"Your Health", {priority:"0001", group:'stats'} 
	),
	badassPoints: new undum.IntegerQuality(
		"BadAss Points", {priority:"0002", group:'stats'}
	),
    skill: new undum.IntegerQuality(
        "Skill", {priority:"0003", group:'stats'}
    ),
    stamina: new undum.NumericQuality(
        "Stamina", {priority:"0004", group:'stats'}
    ),
    roomccode: new undum.NumericQuality(
        "Room C", {priority:"0004", group:'stats'}
    ),
    luck: new undum.FudgeAdjectivesQuality( // Fudge as in the FUDGE RPG
        "<span title='Skill, Stamina and Luck are reverently borrowed from the Fighting Fantasy series of gamebooks. The words representing Luck are from the FUDGE RPG. This tooltip is illustrating that you can use any HTML in the label for a quality (in this case a span containing a title attribute).'>Luck</span>",
        {priority:"0005", group:'stats'}
    ),
    inspiration: new undum.NonZeroIntegerQuality(
        "Inspiration", {priority:"0001", group:'progress'}
    ),
    novice: new undum.OnOffQuality(
        "Novice", {priority:"0002", group:'progress', onDisplay:"&#10003;"}
    ),
	
	chasedByCyborg: new undum.OnOffQuality(
		"Chased By Cyborg", {priority:"0002", group:'progress', onDisplay:"&#10003;"}
	)
};

// ---------------------------------------------------------------------------
/* The qualities are displayed in groups in the character bar. This
 * determines the groups, their heading (which can be null for no
 * heading) and ordering. QualityDefinitions without a group appear at
 * the end. It is an error to have a quality definition belong to a
 * non-existent group. */
undum.game.qualityGroups = {
    stats: new undum.QualityGroup(null, {priority:"0001"}),
    progress: new undum.QualityGroup('Progress', {priority:"0002"})
};

// ---------------------------------------------------------------------------
/* This function gets run before the game begins. It is normally used
 * to configure the character at the start of play. */
undum.game.init = function(character, system) {
    character.sandbox.sys = system;
    character.sandbox.title = "PLAYER ONE";
    character.sandbox.battleStreak = 0;
    character.sandbox.hits = 0;
    character.sandbox.hitPerc = 0;
    character.sandbox.totalAttacks = 0;
    character.sandbox.fightopponent = {};
    character.sandbox.opponentfightchoice = 0; //0-rock (attack), 1-paper (defend), 2-scissors (parry)
	character.sandbox.hasStapler = false;
	character.sandbox.dollars = 0;
	character.sandbox.yourBlockingChance = 85;
    character.sandbox.roombswitch = 1;
    character.sandbox.roomdkey = 0;
    character.sandbox.roomcredbuttonval = -1;
    character.sandbox.roomcbluebuttonval = -1;
    character.sandbox.roomcgreenbuttonval = -1;
    character.sandbox.roomcyellowbuttonval = -1;
    character.qualities.roomccode = "0000";
    character.sandbox.totalHealth = 10;
	character.qualities.health = 10;
	character.qualities.badassPoints = 0;
    character.qualities.skill = 12;
    character.qualities.stamina = 12;
    character.qualities.luck = 0;
    character.qualities.novice = 1;
    character.qualities.inspiration = 0;
    system.setCharacterText("<p>You are unhappily heading to work.</p>");
};

