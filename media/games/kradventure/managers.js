const imgpath = "./media/img/";
var content = document.querySelector('#content');
var content_wrapper = document.querySelector('#content_wrapper');

content.addEventListener('modalevent', function(e){
    
    //{desc:Description here, }
    let isItem = false;
    
    let modalDiv = document.createElement('div');
    modalDiv.classList.add('modal');
    modalDiv.setAttribute('id', 'myModal');
    
    let modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    
    let modalButtonSpace = document.createElement('div');
    modalButtonSpace.classList.add('modal-btn-space');
    
    let modalClose = document.createElement('span');
    modalClose.classList.add('modal-btn');
    modalClose.innerHTML = `OK!`;
    
    //title is optional
    if(e.detail.title){
        let modalTitleDiv = document.createElement('div');
        modalTitleDiv.classList.add('modal-title-div');
        let modalTitle = document.createElement('span');
        modalTitle.classList.add('modal-title');
        modalTitle.innerHTML = e.detail.title;
        modalTitleDiv.appendChild(modalTitle);
        modalDiv.appendChild(modalTitleDiv);
    }
    
    //image is optional - but indicates an item
    if(e.detail.image){
       isItem = true;
       let modalImageDiv = document.createElement('div');
       let modalImage = document.createElement('img');
       modalImage.setAttribute('src', `${imgpath}${e.detail.image}`);
       modalImage.classList.add('modal-image');
       modalImageDiv.classList.add('modal-image-div');
       modalImageDiv.appendChild(modalImage);
       modalContent.appendChild(modalImageDiv);
    }
    
    let modalText = document.createElement('div');
    modalText.classList.add('modal-text');
    modalText.innerHTML = e.detail.desc;
    
    if(e.detail.prompt){
       //create input field with prompt text
        let prompt = document.createElement('input');
        prompt.classList.add('promptinput');
        prompt.setAttribute('id', 'prompt');
        prompt.setAttribute('name', 'answer');
        prompt.setAttribute('placeholder', 'Type Your Answer');

        let promptlabel = document.createElement('label');
        promptlabel.setAttribute('for', 'prompt');
        promptlabel.setAttribute('value', 'promptlabel');
        promptlabel.innerHTML = `<p>${e.detail.desc}</p>`; 
        modalContent.appendChild(promptlabel);
        modalContent.appendChild(prompt);
        
        let modalSubmit = document.createElement('span');
        modalSubmit.classList.add('modal-btn');
        modalSubmit.innerHTML = `Submit`;
        modalButtonSpace.appendChild(modalSubmit);
    }
    
    modalContent.appendChild(modalText);
    modalDiv.appendChild(modalContent);
    modalButtonSpace.appendChild(modalClose);
    modalContent.appendChild(modalButtonSpace);
    
    // Get the modal
    var modal = document.getElementById("myModal");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    modalDiv.style.display = "block";
    
    console.log(`---modal event heard! DISPLAY: ${modalDiv.style.display}`);

    // When the user clicks on <span> (x), close the modal
    modalClose.onclick = function() {
        console.log("---closing modal from button");
        modalDiv.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modalDiv) {
          console.log("---closing modal");
          modalDiv.style.display = "none";
      }
    }
    
 
//    <div id="myModal" class="modal">
//
//      <!-- Modal content -->
//      <div class="modal-content">
//        <span class="modal-close">&times;</span>
//        <p>Some text in the Modal..</p>
//      </div>
//
//    </div>
//    party.confetti(modalContent, {
//  // returns a random number from min to max
//        count: party.variation.range(80, 100)
//    });
    
    setTimeout(function(){
        content.appendChild(modalDiv);
        if(e.detail.confetti || isItem){
           if(isItem){
              party.sparkles(modalContent,{count: party.variation.range(10, 20), shapes: ["star"]});
           }else{
              party.confetti(modalContent,{count: party.variation.range(80, 100)});
           }
           
        }
        
    }, 1000);
    
});

content.addEventListener('endtypeevent', function(e){
    console.log("---TYPING EVENT HEARD");
    displayChoiceList('block');
});

content.addEventListener('clickerlink', function(e){
    console.log(`---CLICKER EVENT HEARD--- Pass? ${e.detail.pass} Percent? ${e.detail.value} Node? ${e.detail.node}`);
    let damage = Math.floor(gameplayer.attack * e.detail.value);
    travelManager.currentSubject.health -= damage;
    console.log(`${travelManager.currentSubject.title} took ${damage}pts of damage, leaving them with ${travelManager.currentSubject.health} health left!`);
    
    travelManager.nodeToLoad = e.detail.node;
    
    var clickerlink = document.getElementById('clickerlink');
    clickerlink.setAttribute('href', './convosectionb');
    
    //fadeConvoList();
});

content.addEventListener('locationevent', function(e){
    console.log(`---LOCATION EVENT! Object: ${e.detail.obj} Action: ${e.detail.action}`);
    //let obj = getObjectFromString(e.detail.obj);
    let obj = travelManager.currentSubject;

    
    if(e.detail.action == "showmap"){
        //this clears out any nodes with an id of "travel", because we're about to create one from scratch
        //plus, this node's choices will change every time
        for (var i = obj.nodes.length - 1; i >= 0; --i) {
            if (obj.nodes[i].id == "travel") {
                obj.nodes.splice(i,1);
            }
        }

        let choices = travelManager.currentLocation.generateMapChoices();

        obj.nodes.push(choices);
    }
    
    if(e.detail.action == "showquests"){
        let choices = travelManager.currentLocation.createQuestChoice(travelManager);
        
        //find the node that is the starting node and add the new nodeChoices.filter(c => c.keyword == 'quest_shortcut');
        let startingNode = travelManager.currentLocation.nodes.filter(n => n.id == travelManager.currentLocation.startingNode);
        let currentNodeChoices = startingNode[0].player_choices;
        for (var i = currentNodeChoices.length - 1; i >= 0; --i) {
            if (currentNodeChoices[i].keyword == "quest_shortcut") {
                console.log("--found old quest list - removing");
                currentNodeChoices.splice(i,1);
            }
        }
        
        if(choices.length > 0){
           startingNode[0].player_choices.push(...choices);
        }
        
    }
    
    
});

function clickerTest(e){
    e.preventDefault();
    console.log("---firing clickertest!!!");
    //return false;
}

//all properties to update should be passed in through the event
content.addEventListener('entityevent', function(e){
    //console.log("---CHARACTER EVENT HEARD---" + e.detail);
//    try{
//        console.log(`Character is: ${e.detail.obj}`);
//    }catch(e){
//        console.log("CHARACTER ERROR: " + e);
//    }
    
    let props = e.detail;
    let action = e.detail.action;
    let keys = Object.keys(props);
    let obj = getObjectFromString(e.detail.obj);
    //let obj = travelManager.currentSubject; //the character we're updating

    keys.forEach((key) => {
        if(props[key] != undefined){
            obj[key] = props[key];
            //console.log(`UPDATE - ${key}: ${obj[key]}`);
        }

    }); 
    if(action == "add"){
       travelManager.add(obj);
       if(obj.type == 'location'){
           writeContent(`<h1>${obj.title}</h1>`);
       }
       
    }
    
});

content.addEventListener('promptevent', function(e){
    //console.log("---PROMPT EVENT HEARD---" + e.detail.promptType);
    console.log("---PROMPT EVENT HEARD---");
    travelManager.promptDetail = e.detail;
    switch(travelManager.promptDetail.action){
        case "create":
            //{evtname:'promptevent', detail:{promptType:'input', action:'create', promptText:'Who the heck are you, anyway?', processNode:'1112', cancelNode:'1113', value:'gameplayer.name'}}
           content.dispatchEvent(new CustomEvent('modalevent', { detail: {desc:`${travelManager.promptDetail.promptText}`, prompt:true}}));
           //createPrompt(travelManager.promptDetail);
           break;
        case "process":
           processPrompt();
           break; 
        default:
           console.log("----ERROR WITH PROMPT EVENT - NO ACTION FOUND");
    }
    
    
});

content.addEventListener('soundevent', function(e){
    //console.log("---SOUND EVENT HEARD---" + e.detail.id);
    loadAndPlaySFX(e.detail.id);
});

//if the node contains anything in the quests property, it is only for dispatching events to create NEW quests
//if the character has info related to an open quest, the quest id should be contained within the keyword
content.addEventListener('questevent', function(e){
    //{evtname:'questevent', detail:{id:'bobstick', character:bob.title, location:'Whodiddle', node:'2221', title:'A Stick in the Woods', desc:'Find a nice stick for Bob in the Whateverest Forest.', location:'whodiddle'}
    console.log("---QUEST EVENT HEARD---" + e.detail.node);
    let obj = {};
    let result = travelManager.find({id:e.detail.id});
    if(result.length < 1){
        obj = new Quest(e.detail);
//        writeContent(`<img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;"><strong>NEW QUEST ADDED:</strong> <em>${obj.title}</em><img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;"><br>${obj.desc}`, 'newquest');
        
        
        content.dispatchEvent(new CustomEvent('modalevent', { detail: {title:`New Quest: ${obj.title}`,desc:`${obj.desc}`}}));
    }else{
        obj = e.detail;
    }
    travelManager.add(obj);
});

content.addEventListener('itemevent', function(e){
    //{evtname:'itemevent', detail:{id: "fruitsamsam", title: "Fruit Samsam", desc: "A lovely fried pastry filled with fruit.", amount:1}}
    //console.log("---ITEM EVENT HEARD---" + e.detail.id);
    //new Item objects need to be created, because they don't exist before this point
    let item = {};
    let result = travelManager.find({id:e.detail.id});
    if(result.length < 1){
        item = new Item(e.detail);
        //we may want to change this to dispatch an event instead
        //writeContent(`<img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;"><strong>New Item Added:</strong> <em>${item.title}</em><br/>${item.desc}`, 'newitem');
        content.dispatchEvent(new CustomEvent('modalevent', { detail: {title:`New Item Added: ${item.title}`,desc:`${item.desc}`,image:`item-${item.id}.png`}}));
    }else{
        item = e.detail;
    }
    travelManager.add(item); 
});

content.addEventListener('poievent', function(e){
    //{evtname:'poievent', detail:{id:'quest_bobstick'}}
    //console.log("---POI EVENT HEARD---" + e.detail.id);
    let poi = {};
    let result = travelManager.find({id:e.detail.id});
    if(result.length < 1){
        poi = new POI(e.detail);
    }else{
        poi = e.detail;
    }
    travelManager.add(poi); //Point Of Interest need to be created, because they don't exist before this point
});

//was this for displaying notices for new quests, new items, etc?
content.addEventListener('displayevent', function(e){
    console.log("---DISPLAY EVENT HEARD---" + e.detail);  
});

content.addEventListener('timerevent', function(e){
    console.log("---TIMER EVENT HEARD---" + e.detail);
});

//this event listener is used to pass the destination information from the player choice to set the value for NodeToLoad
//gets info from the NodeChoice objects
content.addEventListener('nodelink', function(e){
        console.log("---nodelink evt listener EVENT HEARD - choice is " + e.detail.num);
        //console.log(`---travelManager.currentNode: ${e.detail.currentNode.obj}`);
        
        let playerChoice = travelManager.currentNode.obj.player_choices[e.detail.num]; //travelManager.currentNode.obj.player_choices[num]
        //console.log("---NODE LINK EVT LISTENER - player destination is: " + playerChoice.destination);
        
        travelManager.nodeToLoad = playerChoice.destination;

        if(gameplayer.prompt == "input"){
            //console.log(`COMPARING Destination ${playerChoice.destination} with processNode ${travelManager.promptDetail.processNode} or cancelNode ${travelManager.promptDetail.cancelNode}`);
            
            if(playerChoice.destination == travelManager.promptDetail.processNode){
               processPrompt(travelManager.promptDetail);
            }else if(playerChoice.destination == travelManager.promptDetail.cancelNode){
               removePrompt();    
            }
            
        }else if(gameplayer.prompt == "compare"){
            switch(e.detail.num){
                case 0:
                    travelManager.nodeToLoad = comparePrompt(travelManager.promptDetail);
                    break;
                case 1:
                    removePrompt();
                    break;
            }   
        }
        fadeConvoList();
        writeNodeContent(travelManager, travelManager.nodeToLoad);
    }
);

//dispatched as Node loads - immediately activates combat mode, gets an opponent battle choice ready, and prompts the clicker
content.addEventListener('combat', function(e){
    //console.log("----COMBAT MODE EVENT HEARD ");
    let content = document.querySelector('#content');
    //getting the objects from the currentSubject, which should be the opponent
    let evts = [travelManager.currentSubject.challengeEvents[e.detail.challenge],{evtname:'characterevent', detail:{obj:travelManager.currentSubject.id, method:'makeBattleChoice'}}];
    
    //{evtname:'promptevent', detail:{promptType:'clicker', action:'create', promptText:'ATTACK!', objString: [{attemptsAllowed:1, successesRequired:1, successPerc:75, successNode:'6110', defaultNode:'6001'}]}}
    evts.forEach(e => {
        content.dispatchEvent(new CustomEvent(e.evtname, { detail: e.detail }));
    });
    
});

////called from player_choice links, doesn't navigate anywhere, just manages the state of things and ends combat immediately
//function nodeExit(){
//    console.log("---EVENT HEARD - NODE EXIT");
//    gameplayer.inCombat = false;
//    fadeConvo2();
//    fadeConvoList();
//}
//
//content.addEventListener('nodeexit', nodeExit);


//called by the NodeChoice links generated from the character conversation nodes
function linkDispatchEvent(num){
    content.dispatchEvent(new CustomEvent('nodelink', { detail: {num, currentNode:travelManager.currentSubject }}));
}

//this is an eventListener to call a method of a character - something that doesn't return anything
content.addEventListener('characterevent', function(e){
        
        let obj = getObjectFromString(e.detail.obj);
        let method = e.detail.method;
        obj[`${method}`]();
        console.log(`---CHARACTER EVENT HEARD - character is ${obj.id}, function is ${e.detail.method}`);
        
    }
);

/*
this setCharacter function doesn't do much, but it's called from the onClick event when we click characters' names as a link to interact with them. 
Could we make this more usable by passing in an object as a parameter that references not just the specific character, but alters 
certain properties of that character as well? That was probably why we set up the 'characterlink' event listener in the first place...
*/
function setObject(obj){
    if(obj.type == 'location'){
       travelManager.currentLocation = obj;
    }
    travelManager.currentSubject = obj;
    content.dispatchEvent(new CustomEvent('characterlink', { detail: obj }));
}

function questDispatchEvent(obj){
    //pass the whole object in from the Node it came from
    //console.log("----function questDispatchEvent: " + obj);
    content.dispatchEvent(new CustomEvent('questevent', { detail: obj}));
}

//Example {evtname:'eventName', detail:{id:'bobstick', who:bob.title, where:'Whodiddle', title:'A Stick in the Woods', desc:'Find a nice stick for Bob in the Whateverest Forest.'}}
function dispatchCustomEvent(evtObj){
    //pass the whole object in from the Node it came from
    //console.log("---DISPATCHING EVENT");
    content.dispatchEvent(new CustomEvent(evtObj.evtname, { detail: evtObj.detail }));
}

function Quest({type = "quest", id = "questid", title = 'A Quest Title', desc = 'Describe a quest objective here.', finalDesc = 'Describe the conclusion of the quest and what the user achieved.', location = 'No location added.', character = 'No character added.', node = '*', completed = false, updateid = '', amount=1}){
    let props = {type,id,title,desc,finalDesc,location,character,node,completed,updateid,amount};
    let keys = Object.keys(props);
    keys.forEach((key, index) => {
        this[key] = props[key];
        //console.log(`QUEST - ${key}: ${this[key]}`);
    });
}

function Item({type="item", id = "itemid", title = 'An Item Title', desc = 'Describe an item here.', amount = 1, properties = {}}){
    let props = {type,id,title,desc,amount, properties};
    let keys = Object.keys(props);
    keys.forEach((key, index) => {
        this[key] = props[key];
        //console.log(`ITEM - ${key}: ${this[key]}`);
    });
    
}

function POI({type = "poi", id = "poi-id", active = true, amount=1, icon = '', updateid = ''}){
    let props = {type, id, active, amount, icon, updateid};
    let keys = Object.keys(props);
    keys.forEach((key, index) => {
        this[key] = props[key];
        //console.log(`POI - ${key}: ${this[key]}`);
    });
}

class Manager{
    constructor(){
        this.poi = [];
        this.currentLocation = {}; //a Location object that the player is currently visiting
        this.currentSubject = {}; //a Character object that the player is currently interacting with
        this.previousSubject = {}; //depending on the previous object, we may want the current object to do certain things
        this.currentNode = {}; //the current node that the player is visiting within an object (either from a Location or Character)
        this.node = '0001'; //this is chosen by the player's question/comment and determines what node loads next
        this.currentText = ""; //the most recent question/comment made by the player
        this.playerChoice = '';
        this.promptDetail = {};
        this.promptObj = {};
        this.promptObjPropertyString = '';
        this.range = 9;
        this.nodeRedirects = [];
    }
    get currentImageMarkup(){
        //this builds the tags for the location background and character background, if any
        //this ocde was inside the Situation object, but I'm pulling as much code as I can out of there!
        let imageMarkup = '';
        if(this.currentLocation.image != ''){
            //get the background div tag started
            imageMarkup += `<div class="characterBanner transient" style="background-image: url(${imgpath}${this.currentLocation.image})">`;
            //if the current subject is of type 'location' (or if the character doesn't have a profile image), then add the blank profile picture to keep the spacing in there
            if(this.currentSubject.type == 'location' || this.currentSubject.image == ''){
               imageMarkup += `<img class="profileimage" src='${imgpath}profile_blank_133x146.png'></div>`;
            //otherwise, go ahead and add the image of the currentSubject
            }else{
               imageMarkup += `<img class="profileimage" src='${imgpath}${this.currentSubject.image}'></div>`;
            }
        }

        return imageMarkup;
    }
    checkForRedirects(nodeToLoad){
        //console.log(`--checking for redirects: ${nodeToLoad}`);
        //the travelManager's redirect list is global, so it will always have both a node value and an object comma separated
        //if the nodeToLoad value doesn't contain a comma, we need to create a comma separated pair
        let convertedNodeValue = "";
        if(!nodeToLoad.includes(",")){
            convertedNodeValue += `${nodeToLoad},${this.currentSubject.id}`;
            //console.log(`---CONVERTING NODE TO: ${convertedNodeValue}`);
        }else{
            convertedNodeValue = nodeToLoad;
        }
        let result = this.nodeRedirects.filter((obj)=>obj.from==convertedNodeValue);
        
        if(result.length > 0){
            let resultTxt = this.reduceRedirects(this.nodeRedirects, result[0].to);
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
    reduceRedirects(array, to_value, duplicateList = []){
        console.log(`---ADDITIONAL REDIRECTS FOUND: checking redirect value of ${to_value}`);
        let unique_array = array;//do we even need this?
        let reducedArray = [];
        let final = "";
        //the "from" value is the destination targeted for a redirect; the "to" value is the redirect
        //check if any "to" values are used in the "from" values
        //if some are found, that means that some redirects have redirects of their own 
        //we want to create a new array using just the "redirected redirects"
        for(let i=0;i<unique_array.length;i++){
            for(let j=0;j<unique_array.length;j++){
                if(unique_array[j].from == unique_array[i].to){
                   reducedArray.push(unique_array[j]);
                }
            }
        }
        //now we check if the original "to" value we were redirecting to is included in this new array of redirects
        let result = reducedArray.filter((obj)=>obj.from==to_value);
        //if no results show up, it means there are no further redirects, and this current redirect
        //can finally be returned and used
        if(result < 1){
            //console.log(`------returning ${to_value}`);
            return to_value;
        }
        //otherwise, if there is a result, we know additional redirects have been applied, so we drill further down into the list
        //at this point, we compare the redirect object to a growing list of redirect objects that get added every time this recursive
        //behavior happens. this is a failsafe against endless looping. if a redirect ever shows up in THIS array, we terminate immediately and 
        //return whatever Node value we currently have. (ex: A -> B, B -> C, C -> A)
        
        //check the duplicateList to see if this "to" value has already been added
        let duplicates = duplicateList.filter((obj)=>obj.from==result[0].to);
        if(duplicates.length > 0){
           console.log(`----REDIRECT LOOP DETECTED - aborting and returning ${to_value}`);
           return to_value;
        }else{
            //console.log(`---adding ${result[0].to} to the duplicateList`);
            duplicateList.push(result[0]);
            return this.reduceRedirects(reducedArray,result[0].to, duplicateList); 
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
    set nodeToLoad(nodeTxt){
        //check for any Node redirects in the currentSubject for the NodeChoice that was just clicked
        //this might completely change the destination from what was listed in the NodeChoice object's destination value
        //but that's why it's called a redirect! Will we use it often? Who knows? Pretty sure we will!
        nodeTxt = this.checkForRedirects(nodeTxt);
        /*
        The nodeToLoad method checks for three scenarios:
        1. A "!" is found for the node id, and nothing else - it means we're trying to exit an object, and we aren't specifying where to go next
        2. A comma separated value is found - meaning you're specifying both a new node AND a new object
        3. No comma seperated values, just a single value - meaning you're staying in the same object, but traveling to a new node within
        */
        //console.log(`---NODE TO LOAD METHOD - receiving ${nodeTxt}`);
        let destinationSplit = String(nodeTxt).split(',');
        
        //Scenario 1
        //This is an example of when NO information is given about where to go next, you're leaving your current object, and returning to a previous one
        if(nodeTxt.includes("!")){
           this.previousSubject = this.currentSubject;
           
           //if the current subject's already a location, exiting it means generating a dynamic list of locations, based on x/y coordinates
           if(this.currentSubject.type == 'location'){
               //console.log("---EXITING LOCATION!!!");
               dispatchCustomEvent({evtname:'locationevent', detail:{obj:this.id, action:"showmap"}});
               this.node = "travel";
           }else{
               //switch the current subject from the Character to the Location the player is currently on
               this.currentSubject = this.currentLocation;
               //get the node value from the Location's lastNodeVisited property
               this.node = this.currentLocation.lastNodeVisited;
           }
           //console.log(`---EXITING ${this.previousSubject.type}(${this.previousSubject.id}) RETURNING TO PREVIOUS: ${this.currentSubject.id} ${this.node}`);
            
        //Scenario 2
        //Two pieces of info are given - a node value, plus a new object to use. Examples: "0001, betty" or "*, bob"
        //The asterisk is an option, signifying that you want to go to the startingNode, instead of a specific node
        }else if(destinationSplit.length > 1){
           this.previousSubject = this.currentSubject;
           this.currentSubject = getObjectFromString(destinationSplit[1].trim());
           
           //Using the "*" is how you say you want to load the startingNode. This is useful in the event that the startingNode property of the character changes
           if(destinationSplit[0] != "*"){
              this.node = destinationSplit[0];
           }else{
              console.log("---NO NODE VALUE DETECTED - DEFAULTING TO STARTING NODE");
              this.node = this.currentSubject.startingNode;
           }
           
           //every time the new object is a location, we assume we're physically traveling, so store a reference to it
           if(this.currentSubject.type == 'location'){
                this.currentLocation = this.currentSubject;
           }
          
          console.log(`---ENTERING ${this.currentSubject.type}(${this.currentSubject.id}) - ${this.node} FROM: ${this.previousSubject.type}(${this.previousSubject.id})`); 
        
        //Scenario 3
        //Only a node value is given, without comma seperated values - you are staying in the same object, just moving to a new, internal node
        }else{
            this.node = nodeTxt;
        }
        
        //console.log(`---TRAVEL MANAGER Setting Node - Location: ${this.currentLocation.id}, Node: ${this.node}, Subject: ${this.currentSubject.id}`);
    }
    get nodeToLoad(){
        return this.node;
    }
    doesExist(obj){ //returns true or false, if given the id as a parameter
        //example: travelManager.doesExist({id:'betty'});
        let results = this.find(obj);
        return (results.length > 0);
    }
    find(properties) { //returns filtered array of objects from this.poi that have all matching properties as the obj parameter 
        //example: travelManager.find({type:'item'}); or travelManager.find({type:'quest', completed:false})
        return this.poi.filter(function (entry) {
            return Object.keys(properties).every(function (key) {
                return entry[key] === properties[key];
            });
        });
    }
    //This function is primarily for checking the keywords contained the NodeChoice objects
    //Each keyword is compared with what is in the TravelManager (or other places), and is evaluated as a true/false condition. If all are true, the NodeChoice becomes visible for the player to use
    //However, this might be also be used for the redirects as well
    checkPOI(poi){ 
        //console.log("---checking POI: " + poi);
        let allPOIs = [];
        let poiIsValid = true; //true until proven false
        //if poi has a comma, it means there's more than one, so separate them into an array 
        if(poi.includes(',')){
           allPOIs = poi.split(',');
        }else{
        //if there is no comma, it means there's only one, so just shove the single one into the array so we can check any number of them in the same way
           allPOIs.push(poi);
        }
        //console.log("---arrays: " + allPOIs);
        //console.log(`------Running checkPOI with "${poi}"`);
        allPOIs.forEach(p => {
            p = p.trim(); //trim the damn whitespace!!! Important for matching string values!
            //console.log(`---starting with ${p}..`);
                
                //poiIsValid is TRUE by default until proven false through the checkpoints below
                //FIRST CHECKPOINT - CHECK FOR < or > in case we need to compare an amount of something
                if(p.includes('<') || p.includes('>')){
                    let result = '';
                    let delimiter = p.includes('<') ? '<' : '>';
                    let thisID = p.split(delimiter)[0];
                    
                    //if thisAmount
                    let thisAmount = parseInt(p.split(delimiter)[1]);
                    let actualAmount;
                    
                    //console.log(`CHECKING for actualAmount - ${p.split(delimiter)[0]} `);
                    if(p.split(delimiter)[0].startsWith("{")){
                       //console.log(`   - FOUND '{' `);
                       actualAmount = replaceBracketValues(thisID);
                       if(actualAmount == undefined){
                          //console.log(`RESULT - This had brackets, but after converting, didn't seem to have a value`);
                          poiIsValid = false;
                       }else if(p.includes('<')){
                           //console.log(`RESULT - ${actualAmount} less than ${thisAmount}? ${(actualAmount < thisAmount)}`);
                           if(!(actualAmount < thisAmount)){
                               poiIsValid = false;
                           }
                        }else{
                        //...else, the text must be checking for greater than, but if actual amount is less than, set to false
                           //console.log(`RESULT - ${actualAmount} greater than ${thisAmount}? ${(actualAmount > thisAmount)}`);
                           if(!(actualAmount > thisAmount)){
                               poiIsValid = false;
                           }
                        }
                    }else if(this.doesExist({id:thisID})){
                        //...get the amount
                        actualAmount = this.find({id: thisID})[0].amount;
                        //...if the text is checking for less than, but actual amount is greater than, set to false
                        if(p.includes('<')){
                           //console.log(`RESULT - ${actualAmount} less than ${thisAmount}? ${(actualAmount < thisAmount)}`);
                           if(!(actualAmount < thisAmount)){
                               poiIsValid = false;
                           }
                        }else{
                        //...else, the text must be checking for greater than, but if actual amount is less than, set to false
                           //console.log(`RESULT - ${actualAmount} greater than ${thisAmount}? ${(actualAmount > thisAmount)}`);
                           if(!(actualAmount > thisAmount)){
                               poiIsValid = false;
                           }
                        }
                    }else{
                        //console.log(`-The amount of ${thisID} is less than ${thisAmount}, or it doesn't exist in travelManager.`);
                        if(p.includes('>')){
                            poiIsValid = false;
                        }
                    }
                //SECOND CHECKPOINT - CHECK FOR '!' in case we need to check the following conditions:
                //if something ISN'T there - stays true
                //if something IS there, but has its ".active" property set to false - stays true
                //if something is both there and "active" - is false
                }else if(p.includes('!')){ 
                   //remove the "!", keep the rest for checking the ID    
                   p = p.slice(1);
                   
                   //Because we detected "!" - if this POI DOES exist, but the active property is false we return false 
                   if(this.doesExist({id:p})){  
                       //however, if this DOES exist, and the 'active' property is false, that's ok, because it's been "turned off"
                       if(this.find({id: p})[0].active){
                           poiIsValid = false;
                           //console.log(`-POI found ! - also found the POI, and active = true...so poiIsValid = false`);
                       }
                   }
                //THIRD CHECKPOINT - If no special characters are found, reverse of Second Checkpoint
                //if it's not there - is false
                //if it's there, but not active - is false
                }else{
                   //console.log(`---Is POI (${p}) there...? ${this.doesExist({id:p})}`);
                   if(this.doesExist({id:p})){
                       //if the POI is there, but the 'active' property is set to false, set to false;
                       if(this.find({id: p})[0].active == false){
                           //console.log(`-POI found no ! - also found the POI, and active = false...so poiIsValid = false`);
                           poiIsValid = false;
                       }
                   }else{
                       //console.log(`-POI found no ! - did not find the POI...so poiIsValid = false`);
                       poiIsValid = false;
                   }
                }
            
        });
        //console.log(`------final POI value: ${poiIsValid}`);
        return poiIsValid;
    }
    add(obj){
        //type = type.toLowerCase();
        //check to see if one already exists and store a reference to that object
        let poiArr = this.find({id:obj.id});
        if(poiArr.length > 0){
            let thispoi = poiArr[0];
            //console.log(`---Existing ${thispoi.type} - ${thispoi.id} - amount: ${thispoi.amount}`);
            switch(thispoi.type){
                case "location":
                    thispoi.amount++;//What's the difference between .amount and .visits? Will something break if we remove one of these?
                    obj.visits++;//For now, this references the Location Object directly (as opposed to what?), until we figure out if we need to do the redundant counting anymore...
                    break;
                case "character":
                    thispoi.amount++;
                    break;
                case "item":
                    thispoi.amount += obj.amount;
                    if(thispoi.amount < 0){
                       thispoi.amount = 0;
                    }
                    writeContent(`<strong><em>${thispoi.title}</em></strong> ${obj.amount} (${thispoi.amount} total)`, 'gotitem'); 
                    break;
                case "quest":
                    this.update("quest",obj);
                    break;
                case "poi":
                    this.update("poi",obj);
                    break;
            }
            
        }else{
            //console.log(`---NEW ${obj.type}! ${obj.id} - ${obj.amount}`);
            this.poi.push(obj);
        }
        //console.log(`---travelManager adding ${obj.type} - ${obj.id} - amount: ${obj.amount}`)
    }
    addPOI(obj){
        //check if the parameter was given as an object, or a string
        //console.log(`----addPOI: parameter is type ${typeof obj}`);
        if(typeof obj == 'object'){
           this.add("poi", obj); //Point Of Interest need to be created, because they don't exist before this point
        }else{
           this.add("poi", {id:obj});
        }
        
    }
    getQuestList(){
        //provides a list of IDs from all open quests - used for filtering player_choices within Nodes
        let questIDs = [];
        let result = this.poi.map(q => {
            if(q.type == "quest" && q.completed == false){
               //console.log(`---OPEN QUEST FOUND: ${q.id}`);
               questIDs.push(q.id);
            }
        });
        //console.log(`---GET QUEST LIST: ${questIDs}`);
        return questIDs;
    }
    update(type, {id, title, desc, location, who, completed, updateid, active, amount}){
    //update: function(type, obj){
        let props = {id,title,desc,location,who,completed,updateid,active,amount};
        let thispoi = this.find({id:props.id});
        if(thispoi.length > 0){
            let obj = thispoi[0];
            let keys = Object.keys(props);
            //console.log("KEYS ACTIVE: " + keys);
            
            keys.forEach((key, index) => {
                //why are we setting default properties to '' above, if we are ignoring them below?
                //wasn't the whole point of the object destructuring to not have to worry about parameters that weren't being passed in?
                if(props[key] != undefined){
                    if(key == 'id'){
                        console.log(`--key: ${key}`);
                        if(props['updateid']){
                            console.log(`----update found - ${obj['id']} - ${props['updateid']}`);
                           obj['id'] = props['updateid'];
                        }
                    }else{
                       obj[key] = props[key];
                    }
                   
                   console.log(`${type.toUpperCase()}_ UPDATE - ${key}: ${obj[key]}`);
                }
                
            }); 
            
            if(type == "quest" && obj.completed){
                content.dispatchEvent(new CustomEvent('modalevent', { detail: {title:`QUEST COMPLETED! ${obj.title}`,desc:`${obj.finalDesc}`, confetti:true}}));
                
            }else if(type == "quest"){
                content.dispatchEvent(new CustomEvent('modalevent', { detail: {title:`Quest Update: ${obj.title}`,desc:`${obj.desc}`}}));
            }
            
        }else{
            console.log(`---UPDATE: Object of ID '${props.id}' can not be updated - it may not yet exist.`);
        }
        
    }
    
}

const travelManager = new Manager();

const stageManager = {
    currentStyle: '',
    changeStyle: function(className){
        if(className != undefined || className != '' || className != null){
            document.querySelector('body').classList.add(className);
            document.querySelector('p').classList.add(className);
            document.querySelector('h1').classList.add(className);
            document.querySelector('#content_wrapper').classList.add(className);
            this.currentStyle = className;
        }else{
            this.clearStyle();
        }
    },
    clearStyle: function(){
        try{
            document.querySelector('body').classList.remove(this.currentStyle);
            document.querySelector('p').classList.remove(this.currentStyle);
            document.querySelector('h1').classList.remove(this.currentStyle);
            document.querySelector('#content_wrapper').classList.remove(this.currentStyle);
        }catch(e){
            //console.log('No style to remove!');
        }
    }
}

function fadeConvoList(){
    let convoDiv = document.getElementById("content");
    let ulList = Array.from(convoDiv.getElementsByTagName('ul'));
    let current = ulList[ulList.length-1];
    
    let liList = Array.from(convoDiv.getElementsByTagName('li'));
    liList.forEach(l => {
        let start = l.innerHTML;
        let end = start.replace('<a', '<span').replace('a>', 'span>');
        l.innerHTML = end;
        //console.log("---innerHTML: " + l.innerHTML);
    });
    
    //console.log("---LI LIST: " + liList);
    
    try{
        current.classList.add('options fade');
    }catch(e){
        //console.log("fadeConvoList: ERROR ADDING CLASS TO UL LIST");
    }
    
    setTimeout(function() {
        current.style="display:none";
        //console.log('------HIDDEN');
    }, 1400);
    return ulList;
}

function writeContent(content, optionalClass=''){
    //console.log("---WRITE CONTENT!");
    let p = document.createElement('p');
    if(optionalClass != ''){
       p.classList.add(optionalClass);
    }
    p.innerHTML = content;
    document.querySelector('#content').appendChild(p);
}

//this function is to be used anytime the game needs user input more complex than just clicking a choice
//this includes typing in a couple of words, or a timing based minigame (clicker) 
//event dispatched with all of the prompt information from e.detail, e.detail gets stored in travelManager.promptDetail to be used at any time
function createPrompt(detail){
    //destructure the object
    //var {promptText, objString, promptType} = detail;
    
    gameplayer.prompt = detail.promptType;
    
    console.log(`---Creating Prompt: ${gameplayer.prompt}`);
    
    //examples of the detail object passed into this function
    //detail:{promptType:'compare', promptText:'What is the secret password?', objString: 'betty.password', successNode: '1118', failNode:'1119', cancelNode: '1120'}
    //detail:{promptType:'input', promptText:'Who the heck are you, anyway?', objString: 'gameplayer.name', processNode: '1112', cancelNode: '1113'}
    //detail:{promptType:'input', promptText:'Who the heck are you, anyway?', objString: [{value:'gameplayer.name',resultNode:'1112'}], defaultNode:'1112'}
    
    
    let promptdiv = document.createElement('div');
        promptdiv.setAttribute('id', 'promptdiv');
        promptdiv.classList.add('promptbg');
    
    //input types thus far are: "Clicker" (requires tapping at the right time, has success or fail), "Input" (input and store a value for something, like a player's name), and "Compare" (similar to "Input", except the input value is being compared against another value instead of storing the value, so will have a result of success or fail)
    if(detail.promptType=='clicker'){
        //console.log("----ABOUT TO LAUNCH CLICKER " + objString);
        //objString: [{attemptsAllowed:3, successesRequired:1, successPerc:80, successNode:'1116', defaultNode:'1115'}, {next set of options...}]
        setTimeout(function(){clicker.init('clickerholder', detail.objString);}, 1000);
    }else{
        //create input field with prompt text
        let prompt = document.createElement('input');
        prompt.classList.add('promptinput');
        prompt.setAttribute('id', 'prompt');
        prompt.setAttribute('name', 'answer');
        prompt.setAttribute('placeholder', 'Type Your Answer');

        let promptlabel = document.createElement('label');
        promptlabel.setAttribute('for', 'prompt');
        promptlabel.setAttribute('value', 'promptlabel');
        promptlabel.innerHTML = `<p>${detail.promptText}</p>`; 

        promptdiv.appendChild(promptlabel);
        promptdiv.appendChild(prompt);

        document.querySelector('#content').appendChild(promptdiv);
    }
}

//function toggleClickerLink(obj){
//    var clickerlink = document.getElementByID('clickerlink');
//    clickerlink.setAttribute('href', 'convosectionb');
//    
//}

function processPrompt(promptDetail){
    console.log(`---PROCESS PROMPT - ${promptDetail}`);
    gameplayer.prompt = "none";
    let el = document.getElementById('prompt');
    
    //get the real object reference from the string
    let obj = getObjectFromString(promptDetail.value);
    //extract the rest of the string after the first "."
    let objProperty = obj.propString;
    console.log(`objString: ${promptDetail.value}, obj: ${obj}, objProperty: ${objProperty}`);
    objectAssign(obj, objProperty.split('.'), el.value);
    removePrompt();
}

//this function returns a number that is used for the nodeToLoad variable
//the "detail" parameter here is from travelManager.promptDetail, which should have all of the info from the event
function comparePrompt(detail){
    console.log("---COMPARE PROMPT - " + detail);
    gameplayer.prompt = "none";
    
    //UPDATE THE CODE BELOW TO LOOP THROUGH AN ARRAY AND COMPARE MULTIPLE VALUES, RETURNING THE CORRESPONDING RESULTNODE
    //get the actual variable reference from the string, using getObjectFromString
    let valueToCompare = {};
    let el = document.getElementById('prompt');
    let result = travelManager.promptDetail.defaultNode;//this is set in case no compared values are correct
    let obj = {};
    //loop through all available values from the prompt event
    for(i = 0; i < travelManager.promptDetail.objString.length; i++){
        //create the object from the text
        obj = getObjectFromString(travelManager.promptDetail.objString[i].value);
        //get the value of the object's property
        valueToCompare =  getNestedValue(obj, obj.propString);
        //compare and get the corresponding node for loading
        console.log(`Comparing values: ${el.value} and ${valueToCompare}`);
        if(el.value == valueToCompare){
            result = travelManager.promptDetail.objString[i].resultNode;
        }
    }
    
    removePrompt();
    return result;
    
}

function removePrompt(){
    gameplayer.prompt = "none";
    let el = document.getElementById('promptdiv');
    el.parentNode.removeChild(el);
}

function addTimer(seconds, timerEventName){
    
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
    document.querySelector('#content').appendChild(circle);
    
    circle_half.style.setProperty('--duration', `${seconds}s`);
    circle_half_right.style.setProperty('--duration', `${seconds}s`);
    console.log(`----setting timer to ${seconds}s`);
    
    setTimeout(function() {
        console.log("----TIMER DONE!!!");
        circle.parentNode.removeChild(circle);
        dispatchCustomEvent(timerEventName);
    }, (seconds*1000));
    
//    <div class="circle">
//        <div class="circle__half"></div>
//        <div class="circle__half circle__half--right"></div>
//    </div>
}

function fadeConvo(){
    let convo = document.querySelector('#convo');
    convo.className = 'fade';
    setTimeout(function() {
        convo.innerHTML = "";
        convo.className = '';
        //console.log('------CONVO RESET!');
    }, 1200);
}

function fadeConvo2(){
    let charboxes = Array.from(document.querySelectorAll('.characterbox'));
    //console.log(`---CHARBOXES: ${charboxes}`);
    charboxes[0].classList.add('transient');
    charboxes.forEach(p => {
        //p.classList.add('fade');
        setTimeout(function() {
            p.innerHTML = "";
            p.style="display:none";
            //console.log('------CONVO RESET!');
        }, 1400);
    });
//    convo.className = 'fade';
//    setTimeout(function() {
//        convo.innerHTML = "";
//        convo.className = '';
//        console.log('------CONVO RESET!');
//    }, 1000);
}

/*
A desired goal was to be able to reference objects and their properties by including them within dialogue text. 
Example: "Hi, {gameplayer.name}, nice to see you!"
This function provides a way to dynamically grab and return variables without using something like window['variablename'], which didn't seem to work if defined by 'const' or 'let'. 
Still trying to understand why that is. Also still trying to understand if the use of 'eval' is potentially harmful? But for now, these functions work! 

Code below was created using samples from the links below
https://stackoverflow.com/questions/50111200/windowname-equivalent-to-dynamically-access-const-and-let-declarations
https://stackoverflow.com/questions/2886995/javascript-regex-to-convert-dot-notation-to-bracket-notation
*/

function replaceBracketValues(string){
    //regex is looking for text between curly brackets
    //for each match, an object will be determined from the first word before the first "."
    
   var result = string.replace(/{([^}]+)}/g, function(wholematch,firstmatch) {
        var obj = getObjectFromString(firstmatch);
        var value = getNestedValue(obj, obj.propString);
        return typeof value !== 'undefined' ? value : wholematch;
    });
    return result;
}

function getObjectFromString(objString) {
   //console.log(`----getObjectFromString`);
   let objName = objString.split('.')[0];
   let propIndex = objString.indexOf('.');
   let objProp = '';
   //did the object string have a dot?
   if(propIndex > -1){
      //then get the contents of everything past the first dot   
      objProp = objString.slice(propIndex+1);
   }else{
      //if there are no dots, then there are two possibilities:
      //1. The objString is just referencing an object, not any of its properties, and that's what will be returned anyway
      //2. No object exists by the name of objName, and we may need to create one, and give a property with the same name and value as objName
      objProp = objName;   
   }
    
   //below is the murky code I don't fully understand - it's using 'eval' to turn strings into variables, but indirectly?
   //That topLevelGet variable and how it works...?
   var identifierPattern = /^[_$a-zA-Z][_$a-zA-Z0-9]*$/;
   var topLevelGet = (null, eval); //is this just an indirect reference to eval (so it's global, and not local)? 
   let resultObj = identifierPattern.test(objName) && topLevelGet('typeof ' + objName) === 'object' ? topLevelGet(objName) : null;
   //console.log(`Result is: ${objName} of type ${resultObj} objProp: ${objProp}`);
    
   //does this return either null or the eval of the string?    
   if(topLevelGet('typeof ' + objName) === 'object'){ 
      resultObj['propString'] = objProp;
      //console.log(`----This is an object - giving it a propString of ${resultObj['propString']}`);  
   }else{
      //build the object from scratch, for consistent output!
      resultObj = {};
      resultObj['propString'] = objName;
      resultObj[objName] = objName;
      console.log(`----This is NOT an object, so we're making one, and giving it a propString of ${resultObj['propString']}`);
   }
   
   return resultObj;
}

//returns a property of an object, no matter how deep
//first parameter: object that contains property
//second parameter: a string with dot notation of property, ex: getNestedValue(kyleObj,'name.last') returns "Roberts"
function getNestedValue(obj, prop) {
    //console.log(`----getNestedValue ${obj} - ${obj.propString}`);
    var props = prop.split('.'); // split property names
    //console.log("---split: " + props);
    for (var i = 0; i < props.length; i++) {
        if (typeof prop != "undefined") {
          obj = obj[props[i]]; // go next level
        }
    }

    return obj;
}

//this function works with the getObjectFromString function above - once the object is known, set the value
function objectAssign(obj, keyPath, value){
    var lastKeyIndex = keyPath.length-1;
    for(var i = 0; i < lastKeyIndex; i++){
        let key = keyPath[i];
        if(!(key in obj)){
           obj[key] = {};
        }
        obj = obj[key];
    }
    
    obj[keyPath[lastKeyIndex]] = value;
}
