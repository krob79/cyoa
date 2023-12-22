var content = document.querySelector('#content');
var content_wrapper = document.querySelector('#content_wrapper');
console.log("----IMPORTED EVENT LISTENERS");

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
    console.log("---LOCATION EVENT FROM NEW FILE! " + e.detail.obj);
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

//all properties to update should be passed in through the event
content.addEventListener('entityevent', function(e){
    
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
           createPrompt(travelManager.promptDetail);
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
        writeContent(`<img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;"><strong>NEW QUEST ADDED:</strong> <em>${obj.title}</em><img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;"><br>${obj.desc}`, 'newquest');
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
        writeContent(`<img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;"><strong>New Item Added:</strong> <em>${item.title}</em><br/>${item.desc}`, 'newitem');
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
        //console.log("---nodelink evt listener EVENT HEARD - choice is " + e.detail.num);
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

//this is an eventListener to call a method of a character - something that doesn't return anything
content.addEventListener('characterevent', function(e){
        
    let obj = getObjectFromString(e.detail.obj);
    let method = e.detail.method;
    obj[`${method}`]();
    console.log(`---CHARACTER EVENT HEARD - character is ${obj.id}, function is ${e.detail.method}`);
    
}
);