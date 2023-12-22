//CHARACTER OBJECT
//External References: travelManager, gamePlayer, imgpath

function Node(id, text, player_choices, events = []){
    this.id = id;
    this.text = text;
    this.player_choices = player_choices;
    //this will be some event that is fired immediately, could be an event to start a quest, or literally anything, as long as the right event listener is present
    this.events = events; 
    this.separateText = function(){
        //this function checks for text WITH <p> tags that may be mixed with text WITHOUT <p> tags
        //if the text starts with a <p> tag, don't add any additonal styling - it's assumed other styling is being applied and it might not be dialogue
        //Isolate all text that is enclosed in adjacent <p> tags and display it before the image. 
        //Once text appears WITHOUT a <p> tag, it is considered dialogue and displayed after the image. Any text after dialogue that is in <p> tags will display beneath the speech bubble.
            let indexOfTagEnd = 0;
            let before =''; //the string of text that will display before the images
            let after =''; //the string of text that will display after the images
            
            if(this.text.startsWith('<p>')){
                
                
                //split based on all closed <p> tags
                let split = this.text.split('</p>');
                for(var i=0; i<split.length; i++){
                    if(!split[i].startsWith('<p>')){
                       indexOfTagEnd = nthIndex(this.text, "</p>", i);
                       break;
                    }
                }
               
              before = this.text.substring(0, indexOfTagEnd+4);
              after = this.text.substring(indexOfTagEnd+4);
                
            }else{
                after = this.text.trim();
            } 
        //console.log(`----SEPERATE TEXT: before: ${before} -- after: ${after}`);
        return {before, after};
    };
}
 function NodeChoice(text, destination, keyword = 'general', subject = '', icon = ''){
     //console.log(`---CREATING NODECHOICE text:${text}, destination:${destination}, keyword:${keyword}`);
    this.text = text;
    if(typeof destination === 'number'){
       this.destination = destination.toString().padStart((5-destination.toString().length), '0'); //add 4 leading zeros
    }else{
       this.destination = destination;
    }
    
    this.keyword = keyword; //will either be a quest id or some id for a point of interest
    this.icon = icon; //may be used to indicate quests or other special tasks
    if(subject != ''){
       this.subject = getObjectFromString(subject);
    }
 }

function NodeChoiceD({text="Choice Text", destination="0001", keyword = 'general', subject = '', icon = ''}){
     //console.log(`---CREATING NODECHOICE text:${text}, destination:${destination}, keyword:${keyword}`);
    this.text = text;
    if(typeof destination === 'number'){
       this.destination = destination.toString().padStart((5-destination.toString().length), '0'); //add 4 leading zeros
    }else{
       this.destination = destination;
    }
    
    this.keyword = keyword; //will either be a quest id or some id for a point of interest
    this.icon = icon; //may be used to indicate quests or other special tasks
    if(subject != ''){
       this.subject = getObjectFromString(subject);
    }
 }

class Entity{
    constructor(){
        this.id = "MyID";
        this.title = "My Title";
        this.desc = "My Description";
        this.image = '';
        this.amount = 0;
        this.nodesTraveled = 0; //keeps track of how many times the player has traveled between nodes of this single object. Not sure yet all of the ways this could be used, but right now, just keeping track of when the user starts at this object, and how much they move around at this object
        this.nodes = [
            new Node('0001', 'Character text for this node goes here, along with {variables}.', [new NodeChoice('Choice A', 1000),new NodeChoice('Choice B', 2000)]),
            new Node('1000', 'This is where Choice A goes!', [new NodeChoice('Choice A1', 1100),new NodeChoice('Choice A2', 1200)]),
            new Node('2000', 'This is where Choice B goes!', [new NodeChoice('Choice B1', 2100),new NodeChoice('Choice B2', 2200)]),
            new Node('1200', 'What do you mean...? Our family is very proud of this tradition!', [new NodeChoice('Uh..sorry...', 1001)]),
            new Node('3000', "Human, I am detecting hostility from you. SWITCHING TO COMBAT MODE. **BUZZ CLICK CLICK***", [new NodeChoice("Attack", 3100, "combat_rock"),new NodeChoice("Parry", 3200, "combat_paper"), new NodeChoice("Grapple", 3300, "combat_scissors")], [{evtname:'combatmode', detail:{currentSubject:this}}])
        ];
        this.startingNode = '0001';
        this.lastNodeVisited = '0001';
        this.nodeRedirects = [{from:"3000", to:"9999,newgramps"}];
        this.currentNode = {};
        this.challengeEvents = [{evtname:'promptevent', detail:{promptType:'clicker', action:'create', promptText:'ATTACK!', objString: [{attemptsAllowed:3, successesRequired:3, moveInterval: 20, zones:[{start:20,end:30},{start:40,end:50},{start:70,end:80}], successNode:'6110', defaultNode:'6001'}]}},{evtname:'promptevent', detail:{promptType:'clicker', action:'create', promptText:'ATTACK!', objString: [{attemptsAllowed:1, successesRequired:1, successPerc:75, moveInterval: 20, successNode:'6112', defaultNode:'6001'}]}}];
    }
    createNode(objForNode){
        //console.log(`---ATTEMPTING TO CREATE A NEW NODE! ${objForNode.gen_choices}`);
        let choices = [];
        for(var i=0;i<objForNode.gen_choices.length;i++){
            choices.push(new NodeChoiceD(objForNode.gen_choices[i]));
        }
        let node = new Node(objForNode.id, objForNode.text, choices); 
        //this.nodes.push(node);
        return node;
    }
    createQuestChoice(travelManager){
        //console.log(`---CREATING QUEST CHOICES - looking for quests in ${this.title}`);
        let quests = travelManager.find({type:"quest",location:this.id,completed:false});
        
        let choices = [];
        //{evtname:'questevent', detail:{id:'bobstick', character:bob.title, location:'Whodiddle', node:`2221`, title:'A Stick in the Woods', desc:'Find a nice stick for Bob in the Whateverest Forest.', location:'Town of Whodiddle'}}
        if(quests.length > 0){
            //console.log("---FOUND QUESTS");
           quests.forEach(q => {
               //NodeChoiceD({text="Choice Text", destination="0001", keyword = 'general', subject = '', icon = ''})
               //the line of code below works...but it might not always be a character, right?
               //console.log(`----pushing quest: text:QUEST - ${q.title},destination:${q.node} to node: ${travelManager.currentNode.obj.id}`);
               choices.push(new NodeChoiceD({text:`QUEST:${q.title}`,destination:`${q.node}`,keyword:`quest_shortcut`}));
            });
        }else{
            //console.log("---NO QUESTS");
        }
        
        return choices;
    }
    get description(){
        if(this.amount < 1){
            return this.desc;
        }else{
            return this.title;
        }
    }
    checkForRedirects(nodeToLoad){
        //console.log(`--checking for redirects: ${nodeToLoad}`);
        let result = this.nodeRedirects.filter((obj)=>obj.from==nodeToLoad);
        
        if(result.length > 0){
            let resultTxt = result[0].to;
            //this will automatically remove the redirect
            if(result[0].amount != undefined){
               result[0].amount--;
                if(result[0].amount == 0){
                   this.removeRedirect(result[0].from);
                }
            }
            return resultTxt;
        }else{
            return nodeToLoad;
        }
    }
    addRedirect(obj){
        let found = false;
        this.nodeRedirects.forEach((o)=>{
            if(obj.from == o.from){
               found = true;
               console.log(`---there's already something here that uses ${obj.from}`);
            }
        });
        if(!found){
           this.nodeRedirects.push(obj);
        }
        
    }
    removeRedirect(fromTxt){
        for (var i = this.nodeRedirects.length - 1; i >= 0; --i) {
            if (this.nodeRedirects[i].from == fromTxt) {
                this.nodeRedirects.splice(i,1);
            }
        }
        
    }
    getNode(id, travelManager){
        //get a single node by filtering the whole array by id
        let nodeid = id;
        this.lastNodeVisited = id;
        this.nodesTraveled++;
        //content.dispatchEvent(new CustomEvent(e.evtname, { detail: e.detail }));
        
        //for characters, the startingNode (which can change) represents the initial "meeting" of the object, so it is here that the travelManager should count it
        //for locations, this will be the default behavior as well, but we might want to change it so that locations have multiple startingNodes... 
        if(id == this.startingNode){
           //console.log(`---STARTING ID ${this.startingNode} DETECTED!!!`);
           //add this inital encounter to the travelManager, since this is the startingNode
           content.dispatchEvent(new CustomEvent("entityevent", { detail: {obj:this.id, action:"add", amount:1} }));
           //generate a list of shortcuts related to quests that are in this location
           content.dispatchEvent(new CustomEvent("locationevent", { detail: {obj:this.id, action:"showquests"} }));
        }

        //arr is an array, but it should be filtered down to a single result.
        let arr = this.nodes.filter(n => n.id == nodeid);
        console.log(`******GET NODE: ${this.id}(amt:${this.amount}) - Node:${nodeid}(traveled ${this.nodesTraveled})******`);
        this.currentNode = arr[0];
        let nodeChoices = this.currentNode.player_choices;
        
        let questChoices = nodeChoices.filter(c => c.keyword == 'quest_shortcut');
        
        //filter the player choices by keyword = 'general'
        let genChoices = nodeChoices.filter(c => c.keyword == 'general');
        
        //filter the player choices by the conditions described by the keywords 
        let poiChoices = nodeChoices.filter(c => {return travelManager.checkPOI(c.keyword)});
        //console.log("---poiChoices: " + poiChoices);
        
        let combinedChoices = [...questChoices, ...genChoices, ...poiChoices];
        
        //build out the HTML list of choices
        let choicetxt = '<ul class="options">';
        
        //we are making all conversations start with '0001' by default (but it could change after the first visit). Anything that contains '"!"' means it's time to exit.
        //therefore, when generating choices, if a choice has a destination code of '"!"', the link has to take the user back to the Situation where the conversation began.
        //console.log("----GENERATING CHOICES FOR A " + this.type);
        nodeChoices.forEach((choice, index) => {
            //go through all nodeChoices, but only write out the choice if it's included in the combinedChoices array
            //it's important that the index value represents the correct choice from the nodeChoices array, not from the combinedChoices array
            if(combinedChoices.includes(choice)){
                if(choice.destination.includes('!')){
                    if(this.type == 'character'){
                       choicetxt += `<li><a onClick='linkDispatchEvent(${index}); return false;' href='#'>${choice.text} <em>(leave ${this.title})</em></a></li>`;
                    }else{
                       choicetxt += `<li><a onClick='linkDispatchEvent(${index}); return false;' href='#'>${choice.text} <em>(exit ${this.title})</em></a></li>`;
                    }
                    
                }else if(choice.destination == 'clickertoggle'){
                    choicetxt += `<li><div class="clickercontainer"><div id="click_outer" class="clickerbutton"></div><a onclick='clicker.toggleClick()' id='clickerlink' href='convosectionb'><div id="click_inner" class="clickerbutton"></div></a><div id="clickerholder"></div></div></li>`;
                }else{
                    choicetxt += `<li><a onClick='linkDispatchEvent(${index}); return false;' href='#'>${choice.keyword.startsWith('quest_') ? ` <img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;">` : ''}${choice.text}</a></li>`;   
                }
            }
            
        });
        choicetxt += '</ul>';
        
        //DISPATCH ALL EVENTS, IF ANY!!!
        if(Object.keys(this.currentNode.events).length > 0){
            let content = document.querySelector('#content');
            this.currentNode.events.forEach(e => {
                content.dispatchEvent(new CustomEvent(e.evtname, { detail: e.detail }));
            });
        }
        
        //returns the whole Node, plus the filtered list of choices ready to go
        let results = {obj: this.currentNode, choicetxt: choicetxt};
        
        return results;
    }
}

//***Person Objects***
//Not every character you have a conversation with will be someone you fight, and vice versa, but you never know...sometimes, maybe they could be both! Why not?
class CharacterObj extends Entity{
    constructor(){
        super();
        this.type = "character";
        this.title = "Bob - the name to display once you've met";
        this.desc = "a short description of the person to display when you haven't met them";
        this.location = "whodiddle";
        this.greetings = [["Hello there! I'm Bob, nice to meet you!"],["Hey, good to see you again!"]];
        this.backgroundcolor = 'white';
        this.textcolor = '#000000';
        this.textclass = 'characterbox rightarrow transient';//this is what makes the speech bubble
        this.bordercolor = '1px solid white';
        this.image = ``;
        this.startingNode = '0001';
        this.lastNodeVisited = '0001';
        this.maxhealth = 10;
        this.health = 10;
        this.attack = 10;
        this.defense = 0;
        this.battleStreak =0;
        this.hits = 0;
        this.hitPerc =0;
        this.totalAttacks =0;
        this.nextBattleSituation = 'fightrounda';
        this.fightendsituation = 'fightend';
        this.playerdeathSituation = 'playerdeath';
        this.battleChoice = 0;
        this.battleMode = 2;
        this.currDecision = 0;
        this.currBattleChoiceText = "";
        this.attackTextArr = ["Meanyhead bonks your head.", "You take a big swing at Meanyhead, but he parries your attack and clonks you with his fist!", "You anticpate to parry Meanyhead's attack, but he grabs you instead, and headbutts you!"];
        this.battleChoiceText = [[`MeanyHead stands solid in a rock-like formation...`],[`MeanyHead moves lightly, like a piece of paper...`],[`MeanyHead angles their body like a pair of scissors...`]];
        this.battleStatusText = [[`*snarl*`, `'Is that all you got?!?'`],[`status:Your opponent stumbled slightly, surprized by the force of your attack.`, `status:For a moment, your opponent's cocky grin disappears, but returns quickly.`, `Heh...lucky shot there...`],[`status:Your opponent is angry at how much you have hurt them.`, `*breathes heavily*`],[`status:Your opponent is angry and limping.`, `status:Your opponent is wincing from their injuries.`, `grrrr...`],[`status:Your opponent spins wildly in a circle from the impact of your last attack and crashes to the floor on their face. They do not get up.`]];
    }
    testMethod(){
        console.log(`---CALLING TEST METHOD FROM ${this.id}`);
    }
    getDesc(){
        //before officially meeting a character, this will return a description (this.desc) of the character. After the player meets them, it will return just the name (this.title).
        console.log("---GET DESC: " + this.id + " " + this.desc);
        if(!travelManager.doesExist({id: this.id})){
            return this.desc;
        }else{
        //additionally, if there is a quest associated with this character, a star will be displayed at the end of their name
            return `${this.title}${travelManager.doesExist({type:'quest',who:this.title,completed:false}) ? ` <img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;">` : ''}`;
        }
    }
    get currentBattleText(){
        let t = Math.floor(Math.random() * this.battleChoiceText[this.battleChoice].length);
        console.log(`----${this.battleChoiceText[this.battleChoice][t]} and chooses ${this.battleChoice}!!!`);
        return `<p><em>${this.battleChoiceText[this.battleChoice][t]}</em></p>`;
    }
    get attackDamage(){
        let rand = Math.floor(Math.random() * this.attack);
        console.log(`${this.id} generating damage: ${rand}`);
        return rand;
    }
    get greetingText(){
        console.log(`---checking greeting text...amount:${this.amount} nodesTraveled:${this.nodesTraveled}`);
        
        if(this.amount < 2){
           return this.greetings[0][Math.floor(Math.random() * this.greetings[0].length)];
        }else{
           return this.greetings[1][Math.floor(Math.random() * this.greetings[1].length)];
        }
    }
    makeBattleChoice(choice){
            console.log("---MAKING BATTLE CHOICE");
            let r;
            if(this.checkForDrama()){
                //either some drama happens, or battle decisions are made as normal
                console.log("---some drama is happening!");
                //system.doLink(this.nextBattleSituation);
            }else{
                if(choice != undefined){
                   r = pareseInt(choice);
                }else{
                    r = Math.floor(Math.random() * 3);
                }
                
                let t = Math.floor(Math.random() * this.battleChoiceText[r].length);
                this.battleChoice = r;
            }
    }
    adjustHealth(amount){
        this.health += amount;
//        var status = {};
//        status.health = this.health;
//        var perc = Math.round((this.health/this.maxhealth)*100);
//        if(this.health < 1){
//           status.text = this.battleStatusText[4][Math.floor(Math.random() * this.battleStatusText[4].length)];
//        }else if(perc <= 25){
//           status.text = this.battleStatusText[3][Math.floor(Math.random() * this.battleStatusText[3].length)];
//        }else if(perc <= 50){
//           status.text = this.battleStatusText[2][Math.floor(Math.random() * this.battleStatusText[2].length)];
//        }else if(perc <= 75){
//           status.text = this.battleStatusText[1][Math.floor(Math.random() * this.battleStatusText[1].length)];
//        }else{
//           status.text = this.battleStatusText[0][Math.floor(Math.random() * this.battleStatusText[0].length)];
//        }
//        return status;
    }
    checkForDrama(){
        //this function will be different for every opponent - this will determine if the battle will pause to display additional story elements
        //for now, we will assume this happens whenever this character runs the "makeBattleChoice" function
        //system.write("<p>The battle continues...</p>");
    }
}

//returns the index of the nth occurence of pat within str
//https://stackoverflow.com/questions/14480345/how-to-get-the-nth-occurrence-in-a-string
function nthIndex(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}

//takes data from travelManager array and converts it into a base64-encoded string
function saveToStr(){
    let saveData = travelManager.poi.map((a) => {
        if(a.type == 'character'){
           return {id:a.id, type:a.type, props:a.props};
        }else{
           return a;    
        }
        
    });
    
    let obj = Object.assign({}, saveData);
    let str = JSON.stringify(obj);
    let b64str = btoa(str);
    return b64str; 
    
}

//loads data from a base64-encoded string and converts back into data for travelManager
function loadStr(b64){
    let data = JSON.parse(atob(b64));
    let saveData = Object.values(data);
    let obj = {};
    
    let finalData = saveData.map((a) => {
        if(a.type == 'character'){
            obj = getObjectFromString(a.id); 
            obj.props = a.props;
            return obj;
        }else{
           return a;    
        }
        
    });
    
    return finalData;
}

function loadStuff(b64){
    travelManager.poi = loadStr(b64);
    writeContent(`<img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;"><strong>GAME LOADED!</strong> <em><a href='loadgame'>Go to game.</a></em><img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;">`, 'newquest');
}

const mapassist = new CharacterObj();
mapassist.id = "map";
mapassist.startingNode = 'travel';
mapassist.nodes = [
    new Node('0001', "<p><strong>Welcome to the Map Assistant! What do you want to do? Choose Below: (<a onclick='showMap(5)' href='#/' class='raw'>or View Map</a>)</strong></p>", [new NodeChoice('Travel', 'travel')]),
    new Node('0002', "<p>Choose a destination:</p>", [new NodeChoice('stuff', '0002')])
];



const newgramps = new CharacterObj();
newgramps.id = 'newgramps';
newgramps.title = "Gramps";
newgramps.healthMax = 50;
newgramps.health = newgramps.healthMax;
newgramps.image = `profile_gramps_133x146.png`;
newgramps.desc = "a slightly crazy looking old man";
newgramps.greetingsound = "NV_Hylia_Man_Old_Good00_Greeting00.wav";
newgramps.laughsound1 = "NV_Hylia_Man_Old_Good00_LaughL00.wav";
newgramps.laughsound2 = "NV_Hylia_Man_Old_Good00_LaughL01.wav";
newgramps.madsound1 = "NV_Hylia_Man_Old_Good01_Angry01.wav";
newgramps.sadsound1 = "NV_Hylia_Man_Old_Good01_Sad00.wav";
newgramps.surprisesound1 = "NV_Hylia_Man_Old_Good00_SurpriseS01.wav";
newgramps.positivesound1 = "NV_Hylia_Man_Old_Good00_TalkPositive00.wav";
newgramps.positivesound2 = "NV_Hylia_Man_Old_Good00_TalkPositive01.wav";
newgramps.greetings = [[`Wha?!? What's happening? Oh, hey there, young'un!`],['Welcome back, whippersnapper!']];
newgramps.battleChoiceText = [[`Gramps positions the stick in front of him, holding it with both fists...`],[`Gramps holds the stick one-handed like a sword, his other hand flat and raised above his head like some weird kung fu position...`],[`Gramps twirls the stick between his fingers, attempting to confuse you...`]];
newgramps.attackTextArr = ["Gramps\'s stick thwacks your head, as you attempt to grapple him. He cackles.", "You take a big swing at Gramps, but he parries your attack and swats your butt with his stick!", "You anticpate to parry Gramp\'s attack, but he grabs you instead, and twists your nose!"];
newgramps.battleStatusText = [["That's it! Keep it up!", "Come on! I can handle young punks like you!", "Ok! Do a few more moves like that!", "Ya got lucky there!"],["Ooh, think you're sneaky, eh? You have no surprises for me - I have underwear older than you!", "Not bad...not great, either...", "What else ya got?!?"],["Getting tired yet?", "I'm glad we're doing this. At my age, light exercise every day is important!", "*yawns*", "Yer lucky yer Gramma isn't the one training ya - she'd whoop ya!!"],["Your shoes are untied! Just kidding.", "*hums a song*", "*balances his stick on his head for a moment*", "BURP! Pardon me! I had a big snack before you arrived!"],["Alrighty!"]];
newgramps.nodes = [
    new Node('0000', '', [], [{evtname:'nodeexit', detail:{currentsection:''}}]),
    new Node('0001', '{newgramps.greetingText} Well...what brings you here today?', [new NodeChoice("Let's Fight!", '6000'), new NodeChoice("I...don't know...", 9100), new NodeChoice('I\'m ready to go on an adventure!', 9200), new NodeChoice('Just checking to see if you were still alive, you lazy bum!', 9300),new NodeChoice("Leave", "!")],[{evtname:'soundevent', detail:{id:newgramps.surprisesound1}}]),
    new Node('6000', 'Gimme yer best shot!', [new NodeChoice('Ok, experiment over!', '!'), new NodeChoice('CLICK', 'clickertoggle')], [{evtname:'combat', detail:{challenge: 1}}]),
    new Node('6110', "{travelManager.currentSubject.title} took ${damage}pts of damage, leaving them with ${travelManager.currentSubject.health} health left!", [new NodeChoice("Attack 0", 6112, "{newgramps.battleChoice}<1"),new NodeChoice("Parry 0", 6111,"{newgramps.battleChoice}<1"), new NodeChoice("Grapple 0", 6113,"{newgramps.battleChoice}<1"), new NodeChoice("Attack 1", 6113,"{newgramps.battleChoice}>0,{newgramps.battleChoice}<2"),new NodeChoice("Parry 1", 6112,"{newgramps.battleChoice}>0,{newgramps.battleChoice}<2"), new NodeChoice("Grapple 1", 6111,"{newgramps.battleChoice}>0,{newgramps.battleChoice}<2"),new NodeChoice("Attack 2", 6111,"{newgramps.battleChoice}>1"),new NodeChoice("Parry 2", 6113,"{newgramps.battleChoice}>1"), new NodeChoice("Grapple 2", 6112,"{newgramps.battleChoice}>1"), new NodeChoice("Time Out!", 2400)]),
    new Node('6111', '<p>SUCCESS!</p>', [new NodeChoice('Ok, experiment over!', '!'), new NodeChoice('CLICK', 'clickertoggle')], [{evtname:'combat', detail:{challenge: 0}}]),
    new Node('6112', '<p>NO RESULT!</p>', [new NodeChoice('Ok, experiment over!', '!'), new NodeChoice('CLICK', 'clickertoggle')], [{evtname:'combat', detail:{challenge: 1}}]),
    new Node('6113', '<p>LOSS!</p>', [new NodeChoice('Ok, experiment over!', '!'), new NodeChoice('CLICK', 'clickertoggle')], [{evtname:'combat', detail:{challenge: 1}}]),
    new Node('6300', "Good job! You're tougher than you look!", [new NodeChoice('Ok, experiment over!', '!')]),
    new Node('6001', "You missed! Watch your timing and give it another shot!", [new NodeChoice('Fine, Gramps, get ready for a facefull of stick!', '6000'), new NodeChoice('Ow, I have a boo-boo on my thumb!', 2400)]),
    new Node('6666', '<p>This is narration - should be above image.</p><p>But this should be, as well...</p>This is the first line of speech!<p>Now, here\'s more narration.</p>', [new NodeChoice("Leave", "!")]),
    new Node('0002', 'So...ready for your self-defense lessons?', [new NodeChoice("Let's do this.", 9111, 'porchstick<1'), new NodeChoice("Let's do this.", 9112, 'porchstick>0'), new NodeChoice('No, not yet...', 3000), new NodeChoice('You ready for a beatin\', old man?', 2000)],[{evtname:'soundevent', detail:{id:newgramps.greetingsound}}]),
    new Node('9100', 'You don\'t know? Geez, kid, where\'ve you been? You knock your head on somethin\'? You can\'t wander around these parts clueless like that!', [new NodeChoice("I know...sorry...", 9110), new NodeChoice('What do you suggest I do??', 9120), new NodeChoice('I\'ll be fine, don\'t worry about me, old man!', 9130)]),
    new Node('9110', 'Sorry isn\'t good enough! You\'ve gotta be prepared! Fortunately, I can teach you a few handy things that will keep you alive. Ya ready to learn some basic self-defense?', [new NodeChoice("Sure, Gramps!", 9111,'porchstick<1'), new NodeChoice("Sure, Gramps!", 9112,'porchstick>0'), new NodeChoice('Maybe later...', 3000)]),
    new Node('9111', "<p>Gramps nods in approval.</p>Good. At the front of my house, there's another walking stick similar to the one I'm holding here. Go get it and bring it back here, so we can begin.", [new NodeChoice("Leave", "1000,grampsHouse")],[{evtname:'questevent', detail:{id:'grampsstick', character:'newgramps', location:'grampsHouse', node:`0002,newgramps`, title:'Prepare For Training', desc:"Grab the stick from Gramps' front porch and return to him for training. Think you can handle that epic quest?!?", finalDesc:"You brought the stick from the porch. Now comes the HARD work..."}},{evtname:'soundevent', detail:{id:newgramps.laughsound1}}]),
    new Node('9112', '<p>Gramps nods in approval and points at your stick.</p>Good. I see you found the walking stick. Shall we begin?', [new NodeChoice('Yes!', 1000), new NodeChoice('Um, on second thought, I want to wait...', 3000)],[{evtname:'soundevent', detail:{id:newgramps.laughsound1}}]),
    new Node('9120', 'I suggest that you listen close to my advice, see? You\'ve gotta be prepared! Fortunately, I can teach you a few handy things that will keep you alive. Ya ready to learn some basic self-defense?', [new NodeChoice("Sure, Gramps!", 9111,'porchstick<0'), new NodeChoice("Sure, Gramps!", 9112,'porchstick>0'), new NodeChoice('Maybe later...', 3000)]),
    new Node('9200', 'An adventure, eh? You\'re not ready for an adventure, kid - I got underwear that\'s seen more action than you! But I reckon I can show you a few things, if ya want!', [new NodeChoice("Ok, what did you have in mind?", 9120), new NodeChoice('I\'ll be fine, don\'t worry about me, old man!', 9130)],[{evtname:'soundevent', detail:{id:newgramps.laughsound2}}]),
    new Node('9300', '<p>Gramps glares at you.</p>Oh, really...lazy, am I? This old man can smack that cocky smirk off your face. I get it - you\'re young, dumb, and full of fun. You wanna spar with me a couple of rounds?<p>You gulp - this seems serious...</p>', [new NodeChoice("Ok, what did you have in mind?", 9130), new NodeChoice('Take a hike, old man! You can’t teach me NUTHIN!!', 2000)],[{evtname:'soundevent', detail:{id:newgramps.madsound1}}]),
    new Node('9130', 'Hmm, I don\'t think ya get it, kid. There\'s lots of bad stuff out there, a little know-how about fightin\' will do ya a world of good, trust me!', [new NodeChoice("OK, let\'s do it, with no stick!", 9131, 'porchstick<1'), new NodeChoice("OK, let\'s do it, I\'ve got a stick my own!", 1000, 'porchstick>0'), new NodeChoice('Um, on second thought, I want to wait...', 3000)]),
    new Node('9131', '<p>Gramps just smirks.</p>Ah, I see...yer gonna fight me with yer bare hands, are ya? There\'s a spare rod laying on my front porch - go get it and come back!', [new NodeChoice("Ok, I will.", "!")]),
    new Node('9999', 'Good to see you! Before you get head out into the big world, you should let me teach you some basic combat moves - it\'s quite dangerous out there! You need to know how to defend yourself. Whaddya say?', [new NodeChoice("Sure thing, Gramps!", 1000), new NodeChoice('Take a hike, old man! You can’t teach me NUTHIN!!', 2000), new NodeChoice('Not right now...', '!')],[{evtname:'soundevent', detail:{id:newgramps.greetingsound}}]),
    new Node('1000', 'Good. Get your scrawny butt over here! Now that we each have one. we\'re gonna spar with these.', [new NodeChoice("Are you sure I won\'t hurt you?", 1100), new NodeChoice('Ok, no problem.', 1200)]),
    new Node('1100', 'HAHA - you WISH, squirt! I\ll be fine. Now pay attention!', [new NodeChoice("Ok, then...", 1200), new NodeChoice('I\'ve changed my mind. Let\'s do this later.', 3000)]),
    new Node('1200', "Ok, the first thing to remember...you and your opponent will make moves at the same time! One person\'s move will almost always be better than the other person\'s move, and the better move is the one that will deal damage to their opponent. It\'s basically playing Rock, Paper, Scissors. You know how that game is played, right?", [new NodeChoice("Of course...", 1210), new NodeChoice('Mmmm, not really...', 1211)], [{evtname:'soundevent', detail:{id:newgramps.positivesound1}}]),
    new Node('1210', "Good, because this is the tutorial part of this game, and I don\'t feel like explaining kids games!", [new NodeChoice("Word.", 1213)]),
    new Node('1211', "Ya don\'t know Rock, Paper, Scissors! Cheese and crackers, kid, give it a Google or somethin\', we don\'t have all day to explain!", [new NodeChoice("Dang, sorry...", 1213)],[{evtname:'soundevent', detail:{id:newgramps.sadsound1}}]),
    new Node('2400', "<p>Gramps pauses and cocks one eyebrow at you.</p>Eh? You tired or something?", [new NodeChoice("Yeah, I need a break.", 3000),new NodeChoice("HAHA JUST KIDDING!", 2000)]),
    new Node('3000', "What...?!? (sigh) Look, this is important, and my favorite show is coming on TV later. Come back when you\'re ACTUALLY ready to learn!<p>Gramps scratches his butt, and grumbles off without saying another word..</p>", [new NodeChoice("Leave", "!")],[{evtname:'soundevent', detail:{id:newgramps.sadsound1}}]),
    new Node('4000', "<p>Gramps puts his stick down.</p>Whoa, there, sport. I think I\'ve whooped you good enough! Give yer self a rest and come back when yer ready for another round.", [new NodeChoice("Owww...", "!")]),
    new Node('5000', "<p>With one fluid motion, Gramps swings his stick in a wide arc, and knocks your stick out of your hand.</p>Not bad, kid! I think you've shown that yer tough enough so I don't have ta worry aboutcha TOO much out there!", [new NodeChoice("Yeah, I'm amazing - I already knew that.", 5100), new NodeChoice("Gee, thanks Gramps!", 5200, '!grampsstick'),new NodeChoice("Gee, thanks Gramps! And thanks again for the stick!", "!", 'grampsstick')]),
    new Node('5100', "<p>Gramps cocks an eyebrow at you and shakes his head slowly.</p>Don\'t get cocky, kid. There\'s more to learn but we\'ll discuss later! Take this walking stick with you! Go on, git!", [new NodeChoice("Ok, ok...", "!")], [{evtname:'itemevent', detail:{id: "grampsstick", title: "Gramps' Walking Stick", desc: "A solid cane, made from really strong wood.", amount:1}}, {evtname:'poievent', detail:{id: "grampsstick"}}]),
    new Node('5200', "Yer welcome, kiddo. Here, you should take this with you.", [new NodeChoice("Thanks!", "!")],[{evtname:'itemevent', detail:{id: "grampsstick", title: "Gramps' Walking Stick", desc: "A solid cane, made from really strong wood.", amount:1}}, {evtname:'poievent', detail:{id: "grampsstick"}}])
];
newgramps.checkForDrama = function(){
    console.log("---NEWGRAMPS CHECK FOR DRAMA");
    //newgramps.health or newgramps.healthMax;
    if(newgramps.health<35){
        console.log("DRAMA IS CHANGING THINGS!");
        newgramps.addRedirect({from:'6112' , to:'6300'})
       //travelManager.nodeToLoad = '6300';
        return true;
    }
    
//    if(gameplayer.currentHealth < 4){
//        travelManager.nodeToLoad = '4000';
//        console.log("---HEALTH IS LOW!! NodeToLoad:" + travelManager.nodeToLoad);
//        return true;
//    }
//    if(gameplayer.battleStreak == 4 || gameplayer.battleStreak == -3){
//        console.log("---drama detected! battlestreak is: " + gameplayer.battleStreak);
//        gameplayer.battleStreak++;
//        gramps.nextBattleSituation = 'grampshousetraining3';
//        return true;
//    }else{
//        gramps.nextBattleSituation = 'fightrounda';
//    }
    return false;
}

const battlebot = new CharacterObj();
battlebot.id = 'battlebot';
battlebot.title = "Battle Bot";
battlebot.image = `profile_battlebot2_133x146.png`;
battlebot.health = 50;
battlebot.desc = "a large grey robot with a single menacing red eye";
battlebot.greetings = [[`Hello, human. I am Battle Bot. I am a robotic assistant and combat simulator.`],["Hello, human - you have returned. Once again, I am Battle Bot."]];
battlebot.nodes = [
    new Node('0000', 'Farewell, human.', [], [{evtname:'nodeexit', detail:{currentsection:'bobstick'}}]),
    new Node('0001', 'What can I assist you with?', [new NodeChoice("What\'s around these parts?", 1000), new NodeChoice('What do you do?', 2000),new NodeChoice('Shove Battle Bot', '3000'), new NodeChoice('Nothing, take care!', "!")]),
    new Node('1000', "There\'s lots of things to see in this geographical proximity. Are you here for a tour?", [new NodeChoice("Yes, please!", 1100), new NodeChoice('Nah, I\'m here to mess you up', '3000'),new NodeChoice('Shove Battle Bot', '3000'), new NodeChoice("Nevermind, I\'ll see you later!", "!")]),
    new Node('1100', "You are currently in Whodiddle. To the north is Rocco's Pub. To the east is Whateverest Forest. To the south is Gramps and Barney\'s House.", [new NodeChoice("Short and sweet, thanks!", 0001), new NodeChoice("That was boring, let\'s fight instead!", '3000'), new NodeChoice("Good bot, see you later!", "!")]),
    new Node('2000', "I can do lots of things, but I excel at assassinations. Would you like to see a demonstration?", [new NodeChoice("Yes, please!", 2100), new NodeChoice('Nah, I\'m here to mess you up', '3000'),new NodeChoice('Shove Battle Bot', '3000'), new NodeChoice("No I would NOT, I\'ll see you later!", "!")]),
    new Node('2100', "Wonderful! You can be my volunteer!", [new NodeChoice("Wait a sec...", '3000'), new NodeChoice('How about I take YOU out instead?', '3000'),new NodeChoice('Shove Battle Bot', '3000'), new NodeChoice("Nevermind, I\'ll see you later!", "!")]),
    new Node('3000', "Human, I am detecting hostility from you. SWITCHING TO COMBAT MODE. **BUZZ CLICK CLICK**", [new NodeChoice("Attack", 3100, "combat_rock"),new NodeChoice("Parry", 3200, "combat_paper"), new NodeChoice("Grapple", 3300, "combat_scissors"), new NodeChoice("Time Out!", '!3400', "combat_stop")],[{evtname:'combaton', detail:{id:'stuff'}}]),
    new Node('3100', "CLANG!! ENGAGING HUMAN! PREPARING BUZZSAWS!!!", [new NodeChoice("Attack", 3100, "combat_rock"),new NodeChoice("Parry", 3200, "combat_paper"), new NodeChoice("Grapple", 3300, "combat_scissors"), new NodeChoice("Time Out!", '!3400', "combat_stop")]),
    new Node('3200', "SMASH!! BEEP BOOP! SUFFER HUMAN! WARMING UP FLAMETHROWER!!!", [new NodeChoice("Attack", 3100, "combat_rock"),new NodeChoice("Parry", 3200, "combat_paper"), new NodeChoice("Grapple", 3300, "combat_scissors"), new NodeChoice("Time Out!", '!3400', "combat_stop")]),
    new Node('3300', "ZAP!! DEET DEET DOOT! TARGETING VITAL HUMAN ORGANS! CALIBRATING DEATH RAY!!!", [new NodeChoice("Attack", 3100, "combat_rock"),new NodeChoice("Parry", 3200, "combat_paper"), new NodeChoice("Grapple", 3300, "combat_scissors"), new NodeChoice("Time Out!", '!3400', "combat_stop")]),
    new Node('3400', "Human does not wish to fight? DEESCALATING - SWITCHING TO ASSISTANT MODE", [new NodeChoice("Phew...", 0001),new NodeChoice("HAHA JUST KIDDING!", '3000')]),
    new Node('!9999', "BZZZT BZZT SHUTTING DOWN! SYSTEM FAILURE!", [], [{evtname:'nodeexit', detail:{currentsection:'bobstick'}}])
];
battlebot.nextBattleSituation = 'convosectiona';



const gramps = new CharacterObj();
gramps.title = "Gramps";
gramps.health = 5;
gramps.image = `profile_gramps_386x146.png`;
gramps.battleChoiceText = [[`Gramps positions the stick in front of him, holding it with both fists...`],[`Gramps holds the stick one-handed like a sword, his other hand flat and raised above his head like some weird kung fu position...`],[`Gramps twirls the stick between his fingers, attempting to confuse you...`]];
gramps.attackTextArr = ["Gramps\'s stick thwacks your head, as you attempt to grapple him. He cackles. 'Nope. Try again.'", "You take a big swing at Gramps, but he parries your attack and swats your butt with his stick! 'Yer gonna have ta watch closer than that!'", "You anticpate to parry Gramp\'s attack, but he grabs you instead, and twists your nose! 'Are ya paying attention?!?'"];
gramps.battleStatusText = [["'That's it!' Gramps says, 'Keep it up!'", "'Come on! Gramps says, 'I can handle young punks like you!'", "'Ok! Do a few more moves like that!'", "'Ya got lucky there!'"],["Gramps cackles. 'Ooh, think you're sneaky, eh? You have no surprises for me - I have underwear older than you!'", "'Not bad,' Gramps says, 'Not great, either...'", "'What else ya got?!?'"],["Gramps smirks. 'Getting tired yet?'", "'I'm glad we're doing this,' Gramps says, 'At my age, light exercise every day is important!'", "Gramps yawns...", "'Yer lucky yer Gramma isn't the one training ya - she'd whoop ya!!'"],["Gramps points at your feet. 'Your shoes are untied! Just kidding.'", "Gramps hums a song as you both continue to spar.", "Gramps balances his stick on his head for a moment...", "Gramps burps loudly. 'Pardon me! I had a big snack before you arrived!'"],[`Alrighty!`]];
gramps.nodes = [
    
]
gramps.battleMode = 1;
gramps.startBattle = function(character, system, action){
    gameplayer.battleStreak = 0;
    gramps.currDecision = 2;
    gramps.health = 5;
    gramps.nextBattleSituation = 'fightrounda';
    character.sandbox.fightopponent = gramps;
    system.doLink('fightstart');
}
gramps.endBattle = function(character, system, action){
    gramps.nextBattleSituation = 'fightend';
    adjustHealth(character, system, 3, "You got some healing!");
    console.log("----you should be healed! Adding " + character.sandbox.totalHealth + " health...." + character.qualities.health);    
}
gramps.checkForDrama = function(character, system, action){
    if(character.qualities.health < 2){
        system.write("<p>Gramps puts his stick down. 'Whoa, there, sport,' he says. 'I think I've whooped you good enough! Give yer self a rest and come back when yer ready for another round.'</p>"); 
        this.endBattle(character, system, action);
        return true;
    }
    if(gameplayer.battleStreak == 4 || gameplayer.battleStreak == -3){
        console.log("---drama detected! battlestreak is: " + gameplayer.battleStreak);
        gameplayer.battleStreak++;
        gramps.nextBattleSituation = 'grampshousetraining3';
        return true;
    }else{
        gramps.nextBattleSituation = 'fightrounda';
    }
    return false;
}
gramps.playerdeathSituation = "grampshousetrainingend";
gramps.fightendsituation = "grampshousetrainingend";

let loaderBot = new CharacterObj();
loaderBot.id = "loaderbot";
loaderBot.image = "";
loaderBot.greetings = [[`Im Loaderbot. We're trying to load in data.`]];
loaderBot.nodes = [
    new Node('0000', 'Take care!!', [], [{evtname:'nodeexit', detail:{currentsection:'bobstick'}}]),
    new Node('0001', 'Please paste in your save data below:',[new NodeChoice('Here it is!', 1112), new NodeChoice('Uh..nevermind!', 1113)],[{evtname:'promptevent', detail:{promptType:'input', promptText:'Who the heck are you, anyway?', objString:[{value:'gameplayer.name',resultNode:'1112'}]}}]),
    new Node('1112', 'Thank you.')
];

let betty = new CharacterObj();
betty.id = "betty";
betty.title = "Betty";
betty.desc = "a tall, friendly-looking lady with blonde hair and an interesting looking eyepatch";
betty.greetings = [[`Why, hello there! You must be new around here. My name is Betty - nice to meet you!`],["Hey, good to see you again!", `How's it hanging? I'm Betty, remember me?`]];
betty.greetingsound = "";
betty.password = "rainbow";
betty.image = `profile_betty_133x146.png`;
betty.nodes = [
    new Node('0000', 'Take care!!', [], [{evtname:'nodeexit', detail:{currentsection:'bobstick'}}]),
    new Node('0001', '{betty.greetingText} |1000#So {gameplayer.name}...|1000#what |10$did you want to ask me |1000$about?', [new NodeChoice('I want to talk to Bob now!', '6666,bob'), new NodeChoice('Guess the password!', 1117), new NodeChoice('Do the clicker prompt!', 1114), new NodeChoice('Update your startingNode!', 0009), new NodeChoice('Do you like it here?', 1000), new NodeChoice('How long have you lived here?', 2000),new NodeChoice('What\'s good here?', 3000), new NodeChoice('Are there good sticks in the forest?', 4000, 'quest_bobstick,!quest_bobstick2,stick<1'), new NodeChoice('Do the text prompt!', 1111), new NodeChoice("Nothing, take care!", "!")]),
    new Node('0009', 'Update my startingNode? Ok - done!', [new NodeChoice('Awesome.', '!')],[{evtname:'entityevent', detail:{obj:`betty`, startingNode:'1009', image:'profile_male_133x146.png'}}]),
    new Node('1009', 'I\'ve updated my startingNode, you like?', [new NodeChoice('Yup.', 0001)]),
    new Node('0002', 'Was there...|1000# anything else you wanted to ask me about...?', [new NodeChoice('Do you like it here?', 1000), new NodeChoice('How long have you lived here?', 2000),new NodeChoice('What\'s good here?', 3000), new NodeChoice('Are there good sticks in the forest?', 4000, 'quest_bobstick,!quest_bobstick2'), new NodeChoice('Nothing, take care!', '!')]),
    new Node('1000', 'Its pretty| crappy|*crappy | nice - we have free fruit samsams on Sundays!', [new NodeChoice('What are fruit samsams?', 1300, '!samsam'), new NodeChoice('That sounds pretty great!', 1100), new NodeChoice('That\'s silly and stupid...', 1200)]),
    new Node('1111', 'A text prompt..? Uh...ok...what is your name?',[new NodeChoice('Here it is!', 1112), new NodeChoice('Uh..nevermind!', 1113)],[{evtname:'promptevent', detail:{promptType:'input', action:'create', promptText:'Who the heck are you, anyway?', processNode:'1112', cancelNode:'1113', value:'gameplayer.name'}}]),
    new Node('1112', '{gameplayer.name}, eh? Well, nice to meet you, {gameplayer.name}!',[new NodeChoice('Ok, experiment over!', '!')]),
    new Node('1113', 'Don\'t want to tell me your name after all, eh? Well, I\'ll just call you {gameplayer.name}!',[new NodeChoice('Ok, experiment over!', '!')]),
    new Node('1114', 'You want to test the Undertale clicker? OK!', [new NodeChoice('Ok, experiment over!', '!'), new NodeChoice('CLICK', 'clickertoggle')], [{evtname:'promptevent', detail:{promptType:'clicker', action:'create', promptText:'Do the clicker thingy!', objString: [{attemptsAllowed:1, successesRequired:1, successPerc:75, successNode:'1116', defaultNode:'6666'}]}}]),
    new Node('1115', 'Aww, too bad - looks like you failed on the clicker!', [new NodeChoice('Ok, experiment over!', '!')]),
    new Node('1116', 'Nice job - looks like you suceeded on the clicker!', [new NodeChoice('Ok, experiment over!', '!')]),
    new Node('1117', 'You want to guess the password? Ok, go for it!',[new NodeChoice('Here is my guess!', 1112), new NodeChoice('Uh..nevermind!', 1120)],[{evtname:'promptevent', detail:{promptType:'compare', action:'create', promptText:'What is the secret password?', objString: [{value:'betty.password',resultNode:'1118'},{value:'poop',resultNode:'1121'},{value:'shit',resultNode:'1121'}], defaultNode:'1119', cancelNode: '1120'}}]),
    new Node('1118', 'Congratulations, you guessed the password!',[new NodeChoice('Ok, experiment over!', '!')]),
    new Node('1119', 'Sorry, you guessed incorrectly! You should have guessed "{betty.password}"!',[new NodeChoice('Ok, experiment over!', '!')]),
    new Node('1120', 'Changed your mind? No problem!',[new NodeChoice('Ok, experiment over!', '!')]),
    new Node('1121', 'Hey, that\'s not a nice word! This game is over!',[new NodeChoice('Sorry...', 0002)]),
    new Node('1100', 'Heck yeah it is! If you\'ve never had one, you should stop by Wally\'s Fun Shop this Sunday.', [new NodeChoice('Stop by where...?', 3100), new NodeChoice('What are these things again?', 1300, '!samsam'), new NodeChoice('Ok, I will!', 0002)]),
    new Node('1200', 'shakeeffect^|Excuse me?!? |If you\'ve never had one, you have NO idea! Every Sunday at Wally\'s Fun Shop the whole town lines up to get them!', [new NodeChoice('Where...?', 3100),new NodeChoice('Jeez, sorry...', '0002')]),
    new Node('1300', 'Fruit samsams are fresh fruit wrapped in dough, then fried. Wow, are they good!', [new NodeChoice('I agree - that sounds awesome.', 1310),new NodeChoice('I dunno...could be gross...', 1200)]),
    new Node('1310', 'Hey, I forgot - I\'ve got an extra fruit samsam right here, would you like it?', [new NodeChoice('Sure!', 1311),new NodeChoice('Nah, I\'m good...', 0002)]),
    new Node('1311', 'Here you go!', [new NodeChoice('Thanks!', 0002)],[{evtname:'itemevent', detail:{id: "fruitsamsam", title: "Fruit Samsam", desc: "A lovely fried pastry filled with fruit.", amount:1}}, {evtname:'poievent', detail:{id: "samsam"}}]),
    new Node('2000', 'I\'ve lived here so long, I don\'t really remember, but it was not too long after Wacky Wally showed up. That\'s when I founded the Jabbering Jackelope.', [new NodeChoice('Who\'s Wacky Wally?', 2100),new NodeChoice('The Jabbering WHAT...?', 2200)]),
    new Node('2100', 'Oh, you don\'t know Wally? He\'s old school! And actually old! He founded Whodiddle. He definitely knows a thing or seven about the town and the surrounding areas...', [new NodeChoice('Interesting...thanks!', 0002)]),
    new Node('2200', 'The Jabbering Jackelope is the tavern I created near the middle of Whodiddle. A fine establishment! Not like that savage Rocco\'s Rowdy Pub!', [new NodeChoice('I will check it out!', 0002)]),
    new Node('3000', 'Well, I\'m ALWAYS going to mention the Jabbering Jackelope, because I own the place! But Wally\'s Fun Shop is also essential to this town. If you\'re into nature, a stroll through the Whateverest Forest might be your thing!', [new NodeChoice('The Jabbering WHAT...?', 2200),new NodeChoice('Wally\'s Fun Shop?', 3100),new NodeChoice('How do I get to the Whateverest Forest?', 3200)]),
    new Node('3100', 'Wally\'s Fun Shop is DA BOMB DOT COM! I don\'t know what that means, I\'ve just heard people say it. What I mean is, it has both necessities and luxuries! The shop is by the edge of town, by the edge of the forest.', [new NodeChoice('Who\'s this Wally guy?', 2100),new NodeChoice('What forest?', 3200)]),
    new Node('3200', 'The Whateverest Forest? Honestly, I don\'t go there much. Too busy running my place. Some say, it\'s nice, others say it is a little too wild in there...', [new NodeChoice('Good to know, thanks!', 0002)]),
    new Node('4000', 'Sticks...?|1000# Oh! Bob asked for one, didn\'t he? Don\'t bother going to the forest - I\'ve got one here you can give him!', [new NodeChoice('Sweet, thanks! Talk to you later!', '!,newWhodidle')],[{evtname:'itemevent', detail:{id: "stick", title: "Stick", desc: "A sturdy stick, made of good wood from the Whateverest Forest.", amount:1}}, {evtname:'poievent', detail:{id:'quest_bobstick2'}}]),
    new Node('6666', 'THIS IS CRAP! YOU DID TERRIBLE!', [new NodeChoice('Damn...sorry...', '0002')])
];


let bob = new CharacterObj();
bob.id = "bob";
bob.title = "Bob";
bob.desc = "a quiet dude who keeps fumbling with his yo-yo";
bob.greetings = [["Yo, yo, what's up? Get it? I've got a yo-yo! The name's Bob, how ya doin?"],["You've returned! Check out this sweet yo-yo trick!", "How's it hanging? It's me, Bob!"]];
bob.image = `profile_male_133x146.png`;
bob.nodes = [
    new Node('6666', 'Whoa, ok, whats the rush?', [new NodeChoice('Nevermind, bring Betty back!', '0002, betty'), new NodeChoice('Nevermind, goodbye!', '!')]),
    new Node('0001', '{bob.greetingText} What did you want to ask me about?', [new NodeChoice('Give me a Quest!', 2210),new NodeChoice('How long have you been a yo-yo...I mean, learning the yo-yo?', 1000),new NodeChoice('What are the best places to see in Whodiddle?', 2000), new NodeChoice('Bro, I got you that stick...', 2202, "quest_bobstick2, stick>0"), new NodeChoice('Nevermind, goodbye!', '!')]),
    new Node('0002', 'Was there something else...?', [new NodeChoice('How long have you been a yo-yo...I mean, learning the yo-yo?', 1000),new NodeChoice('What are the best places to see in Whodiddle?', 2000), new NodeChoice('Bro, I got you that stick...', 2202, 'quest_bobstick2, stick>0'), new NodeChoice('Nope, see you later!', '!')]),
    new Node('1000', 'All my life! I am part of 7 generations of professional yo-yo\'ers! We compete professionally!', [new NodeChoice('That\'s impressive!', 1100),new NodeChoice('Sounds like you all need a new family tradition...', 1200)]),
    new Node('1100', 'It sure is! We have practice sessions every other 14th of the month, in the back room of The Jabbering Jackelope!', [new NodeChoice('A quirky hobby, indeed...', 1200),new NodeChoice('The where...?', 2100)]),
    new Node('1200', 'What do you mean...? Our family is very proud of this tradition!', [new NodeChoice('Uh..sorry...', 0002)]),
    new Node('2000', 'Well, intown, you should not miss the Jabbering Jackelope for a good time. However, I personally like the quiet atmosphere of Whateverest Forest.', [new NodeChoice('What the heck is the Jabbering Jackelope?', 2100),new NodeChoice('A forest...?', 2200, '!quest_bobstick,!quest_bobstick3'), new NodeChoice('About that forest...', 2201, 'quest_bobstick2')]),
    new Node('2100', `The Jackelope is Whodiddle\'s local tavern! Full of good people, and it\'s nothing like that Rocco\'s Rowdy Pub place, which is too close to here, for my comfort.`, [new NodeChoice('Looks like I\'ll have to visit there sometime...', 0002)]),
    new Node('2200', `Yep, Whateverest Forest is just outside of town. It\'s where I can practice my most complicated tricks. Peaceful, but I don\'t go too deep, because of all the snarfers. Those things are aggressive! Say, speaking of the woods, would you get me a stick from there?`, [new NodeChoice('Uh, sure I guess...', 2210),new NodeChoice('Perhaps another time...', 2220)]),
    new Node('2201', `Yeah, Whateverest Forest! We talked about it earlier! Have you been able to go there and grab a stick for me yet?`, [new NodeChoice('As a matter of fact, I did...', 2202, 'quest_bobstick2'),new NodeChoice('Not yet...', 2203)]),
    new Node('2202', `Aww, yes!!! I really appreciate it!`, [new NodeChoice('You got it, toots!', 0001)],[{evtname:'itemevent', detail:{id: "stick", title: "Stick", desc: "A sturdy stick, made of good wood from the Whateverest Forest.", amount:-1}}, {evtname:'questevent', detail:{id:'bobstick', completed:true}},{evtname:'poievent', detail:{id:'quest_bobstick3'}}]),
    new Node('2203', `Ah, ok, no worries. Just let me know when you found one!`, [new NodeChoice('Will do, homie.', "!")]),
    new Node('2210', `Gee thanks, you\'re the best!`, [new NodeChoice('No problem.', '!')],[{evtname:'questevent', detail:{id:'bobstick', character:'bob', location:'whodiddle', node:`2221,bob`, title:'A Stick in the Woods', desc:'Find a nice stick for Bob in the Whateverest Forest.', finalDesc:'You were able to find a stick that met Bob\'s high standards. Nice work. He\'s picky.'}},{evtname:'poievent', detail:{id:'quest_bobstick'}}]),
    new Node('2220', `Oh...ok. I understand.`, [new NodeChoice('Take care.', '!')]),
    new Node('2221', `Hi! Have you been able to go to Whateverest Forest and grab a stick for me yet?`,[new NodeChoice('As a matter of fact, I did...', 2202, 'quest_bobstick2'),new NodeChoice('Not yet...', 2203)])
];

