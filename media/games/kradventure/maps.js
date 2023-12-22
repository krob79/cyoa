/*
External References:
- travelManager

*/

const mapDisplay = document.getElementById("mapDisplay");



//***Location Object***
class Location extends Entity{
    constructor(){
        super();
        this.type = 'location';
        this.textclass = 'playerbox leftarrow transient';//this is what makes the speech bubble
        this.inner_title = "";
        this.mapImg = {sX: 41, sY: 341, width: 47, height: 57, perc:1};
        this.x = 0;
        this.y = 0;
        this.terrain = 0;
        this.areaOfInfluence = 1; //this is used when checking distance of point from line, if distance is less than or equal to this, it's close.
        this.amount = 0;
        this.visits = 0;
        this.desc = [`<h1>${this.title}</h1><p>This is the first time you've been here.</p>`, `<h1>${this.title}</h1><p>Welcome back!</p>`];
        this.mp3 = '';
        this.ogg = '';
        this.pagestyle = 'none';
        this.secrets = []; //used to store secret locations that will be discovered when attempting to travel here from a specific path
    }
    /*
    Codes for 'terrain' property
    "Visible" = Appears on navigation menus
    "Accessible" = Is a location the player can travel to and interact with
    "Blocker" = If in between two other points, access to the further point is temporaily removed
    0 = "Normal"  visible - yes, accessible - yes, blocker - no   You can see it, travel to it, or pass through it.
    1 = "Blocker" visible - yes, accessible - yes, blocker - yes  You can see it, travel to it, can't pass through it.
    2 = "DeadEnd" visible - yes, accessible - no,  blocker - yes  You can see it, can't travel to it, can't pass through it.
    3 = "Secret"  visible - no,  accessible - yes, blocker - no   You can't see it, but you will end up here while attempting to go somewhere else.
    */
    getTitle(range_current = 1){
        let desctxt = "";
        let locationTitle = "";
        if(range_current < 1){
           console.log("----USING INNER TITLE!");
           locationTitle = this.inner_title != "" ? this.inner_title : this.title;
        }else{
           locationTitle = this.title;
        }
        desctxt += (travelManager.find({type:'quest', location:locationTitle, completed:false}).length > 0) ? `<img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;"> ` : '';
        desctxt += `${locationTitle}`;
        return desctxt;
    }
    getDescription(){
        //console.log("---getting desc");
        let visits = this.visits;
        if(this.desc[visits]){
           return this.desc[visits];
        }else{
           console.log("---NOT FOUND desc");
           return this.desc[this.desc.length-1];
        }
    }
    findAllWithinRange(range){
        //let zoomLevel = this.zoom;
        //console.log(`---Finding all within range of ${range} at zoomLevel ${zoomLevel}...`);
        let locations = allLocations.filter(c => c.zoom == this.zoom);
        //console.log(`The locations left from filtering are: ${locations}`);
        let withinRange = locations.filter((l) => {
            l.distance = this.getDistance(l);
            //console.log(`---WITHIN RANGE? ${l.id} - ${l.distance} / ${range} - ${l.distance <= range} `);
            return l.distance <= range;
        });
        
        let start = this;
        
        withinRange.sort((a,b) => (a.distance > b.distance)? 1 : -1);
        
        //console.log("---WITHIN RANGE: " + withinRange);

        return withinRange;
    }
    getDistance(end){
        //console.log("---getDistance");
        //subtract x coordinates from each other, do the same for y coordinates, then square each of them
        let changeInX = Math.pow((end.x - this.x), 2);
        let changeInY = Math.pow((end.y - this.y), 2);
        //add both together, take the square root of the sum, and round
        //let sqrt_sum = Math.round(Math.sqrt(changeInX + changeInY));
        //maybe don't round?
        let sqrt_sum = Math.sqrt(changeInX + changeInY);
        //console.log(`Getting Distance to (${end.x},${end.y}) - ${sqrt_sum.toPrecision(2)} units.`);
        return sqrt_sum.toPrecision(2);
    }
    pointDistanceFromLine(point, end) {
        //console.log("Getting distance from point...");
        let x1 = this.x;
        let y1 = this.y;
        let x2 = end.x;
        let y2 = end.y;
        let x = point.x;
        let y = point.y;

        var A = x - x1;
        var B = y - y1;
        var C = x2 - x1;
        var D = y2 - y1;

        var dot = A * C + B * D;
        var len_sq = C * C + D * D;
        var param = -1;
        if (len_sq != 0) //in case of 0 length line
          param = dot / len_sq;

        var xx, yy;

        if (param < 0) {
        xx = x1;
        yy = y1;
        }
        else if (param > 1) {
        xx = x2;
        yy = y2;
        }
        else {
        xx = x1 + param * C;
        yy = y1 + param * D;
        }

        var dx = x - xx;
        var dy = y - yy;

        let pointDistance = Math.sqrt(dx * dx + dy * dy);
        //let pointDistance = Math.round(Math.sqrt(dx * dx + dy * dy));    
        //console.log("---point distance: " + pointDistance);
        return pointDistance;
    }
    generateMapChoices(){
        //console.log("--GENERATING CHOICES FROM LOCATION " + this.id);
        
        let id = "travel";
        let destinations = this.findAllWithinRange(travelManager.range);
        let gen_text = "Where should I go..?<p>Travel to one of the locations below (<a onclick='showMap(5)' href='#/' class='raw'><strong>View Map</strong></a>)</p>";
        let gen_choices = [];
        let cardinalDirection = "";
        
        destinations = this.filterChoices(destinations);
        
        
        //[new NodeChoice("Yeah, I'm amazing - I already knew that.", 5100), new NodeChoice("Gee, thanks Gramps!", 5200, '!grampsstick'),new NodeChoice("Gee, thanks Gramps! And thanks again for the stick!", "!", 'grampsstick')]
        for(var i=0;i<destinations.length;i++){
            cardinalDirection = ""
            //console.log(`---${destinations[i].id} distance: (${destinations[i].distance})`);
            //get the cardination direction text so it can be added to the end of the distance
            if(destinations[i].y > this.y){
                cardinalDirection += "north";
            }else if(destinations[i].y < this.y){
                cardinalDirection += "south";
            }
            
            if(destinations[i].x > this.x){
                cardinalDirection += "east";
            }else if(destinations[i].x < this.x){
                cardinalDirection += "west";
            }
            
            if(destinations[i].distance < 1){
                gen_choices.push({text:`Re-enter ${destinations[i].title} (<em>You are here</em>)`, destination: `*,${destinations[i].id}`, keyword:'general'});
            }else{
                //I made a duplicate of the NodeChoice object, called NodeChoiceD, for dynamic. This version accepts objects as a parameter.
                //Somehow, I need to just update the regular NodeChoice object. It's easier to pass an object as a parameter.
                //NodeChoiceD({text="Choice Text", destination="0001", keyword = 'general', subject = '', icon = ''})
                if(destinations[i].secrets.length > 0){
                   gen_choices.push({text:`${destinations[i].title} (${destinations[i].distance} mi ${cardinalDirection})`, destination: `*,${destinations[i].secrets[0].id}`, keyword:'general'});
                }else{
                    gen_choices.push({text:`${destinations[i].title} (${destinations[i].distance} mi ${cardinalDirection})`, destination: `*,${destinations[i].id}`, keyword:'general'});
                }
            }
            
        }
        
        //console.log("---USING NEW METHOD OF CREATING NODECHOICE!!");
        let obj = {id:id, text:gen_text, gen_choices:gen_choices};
        
        //this.createNode(`{id:${id}, text:${gen_text}, player_choices:${gen_choices}}`);
        return this.createNode(obj);
    }
    filterChoices(arr){
        //console.log("----filterChoices");
        //create new array with just blocker locations
        let blockerSpots = arr.filter(loc => loc.terrain == 1 || loc.terrain == 2);
        //create new array with just secret locations
        let secretSpots = arr.filter(loc => loc.terrain == 4);
        //make filtered array with just regular visible locations
        let regularSpots = arr.filter(loc => loc.terrain < 1);

        //console.log("Regular Spots: " + regularSpots);
        let finalArr = [];
        //loop through array, looking for "blocking locations" that are in the path between the current location and a destination. If a blocking spot is detected, add the blocking location to the results array, instead of the regular destination. This means the player has to go to the blocking location to get beyond it, else find a different way

        //for each regular spot, loop through all blockers and check their proximity
        for(let i = 0; i < regularSpots.length; i++){
            if(blockerSpots.length > 0){
                //console.log("---checking blockers");
                for(let j = 0; j < blockerSpots.length; j++){
                       //loop through and get the distance of each point from the path
                       //console.log(`--checking path to ${regularSpots[i].title} against ${blockerSpots[j].title}`);
                       let blockDistance = this.pointDistanceFromLine(blockerSpots[j], regularSpots[i]);
                       //console.log(`blockdistance: ${blockDistance} - areaOfInfluence: ${blockerSpots[j].areaOfInfluence}`);
                       /*
                       if the blocker location's distance from the travel path is LESS than the area of influence (meaning it's close), and
                       the blockerSpot has a distance of more than zero (meaning you're NOT currently at the blocker location) 
                       */
                       if(blockDistance <= blockerSpots[j].areaOfInfluence && this.getDistance(blockerSpots[j]) > 0){
                           //console.log(`---blocker found! ${blockerSpots[j].id} is <= (${blockerSpots[j].areaOfInfluence}) from path to ${regularSpots[i].title}`);   
                           if(blockerSpots[j].terrain == 1 || blockerSpots[j].terrain == 2){
                              finalArr.push(blockerSpots[j]);
                           }
                       }else{
                          finalArr.push(regularSpots[i]);
                       }
                }
            }else{
               finalArr.push(regularSpots[i]); 
            }
        }
        //console.log("finalArr: " + finalArr.length);

        //sort everything by distance closest to furthest
        finalArr.sort((a,b) => (a.distance > b.distance)? 1 : -1);
        let finalArrUnique = [];
        //If a blockerSpot blocks 2 locations in the menu, we don't want it showing up twice in the menu. So eliminate duplicates
        finalArr.forEach((c) => {
            if (!finalArrUnique.includes(c)) {
                finalArrUnique.push(c);
            }
            //console.log("Final Arr: " + c);
        });

        //now that you have the final list of accessible locations, check for secrets
        for(let k = 0; k < finalArrUnique.length; k++){
            //console.log(`-----CHECKING ${finalArrUnique[k].title}`);
            finalArrUnique[k].secrets = []; //start with clean slate - no previous secrets stored
            
            for(let l = 0; l < secretSpots.length; l++ ){
                //check for point to path distance the same way we did for blockers
                let secretDistance = this.pointDistanceFromLine(secretSpots[l], finalArrUnique[k]);
                //console.log("---secret distance: " + secretDistance);
                //this time, however, we just make a note of the location and check for it later, we don't add anything to the list 
                if(secretDistance <= secretSpots[l].areaOfInfluence && this.getDistance(secretSpots[l]) > 0){
                   finalArrUnique[k].secrets.push(secretSpots[l]);
                   //console.log(`---secret detected on the way to ${finalArrUnique[k].title}`);
                }
            }

        }
        return finalArrUnique;
    }
}


function showMap(gameplayer_range){
    if(gameplayer_range < 1){
        draw(1.4);
    }else{
        draw(0.6);
    }
    
    mapDisplay.style.visibility='visible';
}

function processMapChoice(loc, character, system, action){
    //console.log("---processMapChoice");
    
//    //BEFORE ANYTHING ELSE, CHECK FOR SECRETS AND BOUNCE THE USER
//    let s = gameplayer.secrets.filter(s => s.loc == loc);
//    if(s.length > 0) {
//        //console.log("---ABORT LOADING THIS LOCATION! WE HAVE FOUND A SECRET!!"); 
//        system.write(`<p>You're on your way to ${loc.title}, but something happens...</p>`);
//        //get the id
//        let link = s[0].secret.id;
//        //then purge the secrets list so we don't detect the secret again every time processMapChoice is called and get caught in a loop
//        gameplayer.purgeSecrets();
//        //go there immediately! we were never here!
//        system.doLink(link);
//        //console.log("---we're going to: " + link);
//        return;
//    }
//    try{
//        //console.log("---the secret we're going to is: " + link);
//    }catch{
//        //console.log("---no secret link");
//    }


    //THAT SHOULD BE IT FOR ANY CODE REGARDING SECRET LOCATIONS! NOW ASSUMING YOU ARE HERE AT THE LOCATION FOR GOOD!
    //This should be only for "main" locations, not subsections of locations.
    gameplayer.setLocation(loc.x, loc.y);
    //try{
    //change the CSS for background image, text colors, etc., if necessary    
    stageManager.changeStyle(loc.pagestyle);
    //}catch(e){
      //  console.log("___NO STAGE");
    //}
    
    //to make a record of this visit, travelManager will either create a new object and push it into the encounters array (for the first visit), or find and increment the existing item's visits property
    travelManager.currentLocation = loc;
    travelManager.add(loc);
    system.setCharacterText(`<p>You are at ${loc.title}</p>`);
    //system.write(`<h1>${loc.title}</h1>`);
    //is this code below necessary? Would a 'new' indication be better in the location desc? 
    if(loc.visits == 0){
        system.write(`<h4 style='text-align:center; margin-top:-20px;'><em>(New Location!)</em></h4>`);
    }
    //loadAndPlayMusic(loc.mp3);
    system.write(`<p>${loc.getDescription()}</p>`);
    //check quests in this area and list them as a reminder
    let quests = travelManager.find({type:"quest",location:loc.title,completed:false});
    if(quests.length > 0){
       system.write("<p>Quests in this area:</p>");
        quests.forEach(q => {
            system.write(`<p><img src="${imgpath}questicon_full.png" style="position: relative;top: 1px;"><em>${q.title}</em> - ${q.desc}</p>`);
        });
    }
}

const origin = new Location();
origin.zoom = 0; //just giving this a number so that it doesn't show up on location results
origin.terrain = 4;
origin.id = "origin";
origin.title = "Origin (not an actual location to visit)";
origin.x = 0;
origin.y = 0;

const babblingStreams = new Location();
babblingStreams.zoom = 0;
babblingStreams.id = "babblingStreams";
babblingStreams.title = "Babbling Streams";
babblingStreams.inner_title = "Babbling Streams";
babblingStreams.pagestyle = "forest";
babblingStreams.desc = ["This place is known for it's streams. Mostly because they won't shut up."];
babblingStreams.x = -3;
babblingStreams.y = -2;
babblingStreams.image = 'bg_babblingstreams_386x146.png';
babblingStreams.nodes = [
    new Node('0001', "<p>This place is known for it's streams. Mostly because they won't shut up. But 'they' doesn't really refer to the streams. There are other voices in these places that won't stop. And they can drive you mad if you're not careful...</p>", [new NodeChoice("Leave","!")])
];

//Location Objects
const barneysShed = new Location();
barneysShed.zoom = 0;
barneysShed.id = "barneysShed";
barneysShed.title = "Barney's Shed";
barneysShed.inner_title = "Barney's Shed";
barneysShed.nodeRedirects = [{from:"*,whodiddle", to:"*,secretplace1"}];
barneysShed.pagestyle = "forest";
barneysShed.desc = ["Barney drinks here. It's kind of a weird place.","Barney's here now, but he's passed out on the ground."];
barneysShed.mp3 = "Tad-Lad-Froggo-Fast-OST.mp3";
barneysShed.x = -2;
barneysShed.y = 1;
barneysShed.image = 'bg_barneysshed_386x146.png';
barneysShed.nodes = [
    new Node('0001', "<p>Barney's got a lot of junk at his place, but somewhere in that shed is a special device which may help you on your travels. Barney may need a special piece to get it working. He doesn't care about the thing anymore, so if you provide the piece, he might just let you have it. The Town of Whodiddle has lots of shops and might have what you're looking for...</p>", [new NodeChoice("Leave","!")])
];


const whodiddle = new Location();
whodiddle.zoom = 0;
whodiddle.title = "Town of Whodiddle";
whodiddle.inner_title = "Town Entrance";
whodiddle.pagestyle = "forest";
whodiddle.desc = ["Lots of random things here. Whodiddles, mostly.","The Whodiddles ain't doing jackdiddlywho who right now."];
whodiddle.mp3 = "Town-Hall.mp3";
whodiddle.nodeRedirects = [{from:"*,roccospub", to:"*,secretplace1", amount:1}];
whodiddle.x = 3;
whodiddle.y = 3;
whodiddle.id = 'whodiddle';
whodiddle.image = 'bg_whodiddle_386x146.png';
whodiddle.nodes = [
    new Node('0000', 'Farewell, human.', [], [{evtname:'nodeexit', detail:{currentsection:'bobstick'}}]),
    new Node('0001', '<p>This is Whodiddle! A new version! To your left is Section A, to your right is a Dark Alley. Where do you want to go?</p>', [new NodeChoice("Bob's Quest", "2210,bob"),new NodeChoice("Check out Section A", '1000'), new NodeChoice('Head towards the Dark Alley', '2000'), new NodeChoice("Try Wacky Wally's", '3000'), new NodeChoice('Go Towards the Jabbering Jackelope', '4000'), new NodeChoice("Leave Whodiddle", '!')]),
    new Node('1000', "<p>You walk down Section A and you see <a onClick='linkDispatchEvent(0); return false;' href='#'>{betty.description}</a>. Not too far from her is <a onClick='linkDispatchEvent(1); return false;' href='#'>{bob.description}</a>.</p>", [new NodeChoice("Talk to Betty", "*, betty", "hidethis"), new NodeChoice("Talk to Bob", "0001, bob","hidethis"), new NodeChoice('Head towards the Dark Alley', '2000'), new NodeChoice("Try Wacky Wally's", '3000'), new NodeChoice('Go Towards the Jabbering Jackelope', '4000'), new NodeChoice("Leave Whodiddle", '!')]),
    new Node('2000', "<p>This is Whodiddle Section B. In the dark alleyway, <a onClick='linkDispatchEvent(0)' href='convosectionb'>{newgramps.description}</a> is nearby. So is <a onClick='linkDispatchEvent(1)' href='convosectionb'>{battlebot.description}</a>.</p>", [new NodeChoice("Talk to Gramps", '0001,newgramps'),new NodeChoice("Talk to Battlebot", "0001, battlebot"), new NodeChoice("Back to Section A", "1000"), new NodeChoice("Try Wacky Wally's", '3000'), new NodeChoice('Go Towards the Jabbering Jackelope', '4000'),new NodeChoice("Leave Whodiddle", '!')],[{evtname:'entityevent', detail:{obj:`whodiddle`,image:'bg_darkalley_386x146.png'}}]),
    new Node('3000', "<p>This is Wacky Wally's place. Woo hoo...</p>", [new NodeChoice("Back to Section A", "1000"),new NodeChoice('Head towards the Dark Alley', '2000'), new NodeChoice('Go Towards the Jabbering Jackelope', '4000')]),
    new Node('4000', "<p>At the Jabbering Jackelope, nobody ever shuts up!</p>", [new NodeChoice("Back to Section A", "1000"),new NodeChoice('Head towards the Dark Alley', '2000'), new NodeChoice("Try Wacky Wally's", '3000')]),
]

const grampsHouse = new Location();
grampsHouse.zoom = 0;
grampsHouse.title = "Gramps' House";
grampsHouse.inner_title = "Gramps' House";
grampsHouse.pagestyle = "forest";
grampsHouse.desc = ["Lots of random things here. Whodiddles, mostly.","The Whodiddles ain't doing jackdiddlywho who right now."];
grampsHouse.mp3 = "Breezy-Woods.mp3";
grampsHouse.x = 1;
grampsHouse.y = 0;
grampsHouse.id = 'grampsHouse';
grampsHouse.image = 'bg_grampshouse_386x146.png';
grampsHouse.nodes = [
    new Node('0001', "<p>Gramps house appears as a modest, but sturdy looking house on a nearby hill.</p>", [new NodeChoice("Fight Gramps", "6000,newgramps"),new NodeChoice("Approach Gramps' House", '1000', 'porchstick<1'),new NodeChoice("Approach Gramps' House", '2000', 'porchstick>0'),new NodeChoice("Leave Gramps' House", '!')]),
    new Node('1000', "<p>You walk to the front porch of Gramps' house. To the right is a path that wraps around to the back of the house. There's not much here except an old rocking chair, and <a onClick='linkDispatchEvent(0)' href='convosectionb'>a polished walking stick</a>.</p>", [new NodeChoice("Take Stick", '1100', 'hidethis'),new NodeChoice("Take path to right of house (asleep)", '3000', 'newgramps<1'), new NodeChoice("Take path to right of house (awake)", '3001', "newgramps>0"), new NodeChoice("Leave", '!')]),
    new Node('2000', "<p>You walk to the front porch of Gramps' house. To the right is a path that wraps around to the back of the house. There's not much here except an old rocking chair.</p>", [new NodeChoice("Take Path", '3001'), new NodeChoice("Go back to the entrance", '0001')]),
    new Node('1100', "<p>You take the stick!</p>", [new NodeChoice("Take path to right of house (asleep)", '3000', 'newgramps<1'), new NodeChoice("Take path to right of house (awake)", '3001', "newgramps>0"),new NodeChoice("Go back to the entrance", '1000')],[{evtname:'itemevent', detail:{id: "porchstick", title: "Walking Stick", desc: "Well worn, but polished and solid. Feels smooth to the touch.", amount:1}}]),
    new Node('3000', "<p>The backyard behind Gramps' house has a wide grassy field, with two large trees and a hammock between them. On the hammock is <a onClick='linkDispatchEvent(0)' href='convosectionb'>an old man, snoring loudly</a>.</p>", [new NodeChoice("Wake the old man", '*,newgramps'), new NodeChoice("Go back to the front of the house", '1000', 'porchstick<1'),new NodeChoice("Go back to the front of the house", '2000', 'porchstick>0')]),
    new Node('3001', "<p>The backyard behind Gramps' house has a wide grassy field, with two large trees and a hammock between them. <a onClick='linkDispatchEvent(0)' href='convosectionb'>Gramps</a> is standing there, waiting for you.</p>", [new NodeChoice("Talk to Gramps", '*,newgramps', "hidethis"), new NodeChoice("Go back to the front of the house", '1000', 'porchstick<1'),new NodeChoice("Go back to the front of the house", '2000', 'porchstick>0')]),
    new Node('4000', "<p>You poke the old man, and he immediately cries out, flailing his limbs and somersaults out of the hammock away from you.</p>", [new NodeChoice("Go back to the front of the house", '1000', 'porchstick<1'),new NodeChoice("Go back to the front of the house", '2000', 'porchstick>0')]),
];
let blocker1 = new Location();
blocker1.zoom = 0;
blocker1.id = "blocker1";
blocker1.terrain = 1;
blocker1.title = "Blocker Camp";
blocker1.nodes = [
    new Node('0001', "<p>This place is called Blocker Camp, until it gets named something else. This type of location prevents you (or blocks you) from skipping past it to access other locations that might be close by. This place might be a camp where a bunch of bandits live, or some other risky or dangerous area that you can't go through without stopping here. It could also be some sort of gatekeeping area that bottlenecks your travel, forcing you this particular way. Perhaps part of a quest could be to accomplish something here, which could then change the status of this location to a normal location, allowing you to skip by if you need!</p>", [new NodeChoice("Leave", "!" )])
]
blocker1.desc = ["This place is called Blocker Camp"];
blocker1.areaOfInfluence = 1;
blocker1.x = -2;//0
blocker1.y = 6;//2

let secretplace1 = new Location();
secretplace1.zoom = 0;
secretplace1.id = "secretplace1";
secretplace1.title = "Hidden Forest Nook";
secretplace1.desc = [`Whoa, what is this place?!?`];
secretplace1.nodes = [
    new Node('0001',"<p>Whoa, what is this place?!? This wasn\'t on the map! Looks like it was hidden, and you stumbled across it because it happened to be on the path you were going. Both similar to and different from Blocker Camp, this location forces you to go here initially, but then automatically turns into a normal location. And, it hides itself, not other locations! Well, it\'s not secret now, because we found it. What other secret places might there be?</p>",[new NodeChoice("Leave", "!")])
]
secretplace1.terrain = 4;
secretplace1.areaOfInfluence = 1;
secretplace1.x = 0;//-2
secretplace1.y = 2;//6

let loc_oldemill = new Location();
loc_oldemill.zoom = 0;
loc_oldemill.id = "oldemill";
loc_oldemill.title = "The Olde Mill";
loc_oldemill.desc = ["This the Olde Mill. It used to mill stuff. Not anymore. Now it's just old. True story. Nearby, you see a black dog with floppy ears leashed to a stake in the ground. It looks bored.", "Back at the Mill. Still old. Even older, now. That black dog is still here, still leashed. It looks excited to see you, and whines a little."];
loc_oldemill.x = -5;
loc_oldemill.y = 5;

let roccospub = new Location();
roccospub.zoom = 0;
roccospub.id = "roccospub";
roccospub.title = "Rocco's Rowdy Pub";
roccospub.pagestyle = "wood";
roccospub.desc = ["This bar is full of tough, scary customers who all turn to scowl at you."];
roccospub.nodes = [
    new Node('0001',"<p>This bar is full of tough, scary customers who all turn to scowl at you. 'Hey, jerkface,' one of them says, 'this place is too rowdy for you - get lost! Next time you come in here, you'll be served a knuckle sandwich!</p>",[new NodeChoice("Leave", "!")])
]
roccospub.x = 2;
roccospub.y = 6;

let loc_biggcity = new Location();
loc_biggcity.zoom = 0;
loc_biggcity.id = "biggcity";
loc_biggcity.title = "Bigg City Limits";
loc_biggcity.desc = ["This is a big city, see? A fast paced world, see? Gotta think fast walk fast act fast buy sell buy sell. Ya spend money ta make money, bucko! Outta the way!"];
loc_biggcity.x = 7;
loc_biggcity.y = 9;

let loc_crossroads = new Location();
loc_crossroads.zoom = 0;
loc_crossroads.id = "crossroads";
loc_crossroads.title = "The Cross Roads";
loc_crossroads.pagestyle = "field";
loc_crossroads.desc = ["See you at the crossroads, crossroads, crossroads...So you won't be lonely."];
loc_crossroads.x = 0;
loc_crossroads.y = 9;

let loc_wheatfields = new Location();
loc_wheatfields.zoom = 0;
loc_wheatfields.id = "wheatfields";
loc_wheatfields.title = "Wheat Fields";
loc_wheatfields.desc = ["Bro, there's just...a lot of wheat out here. BOOOOOOORING."];
loc_wheatfields.x = -9;
loc_wheatfields.y = 10;

let loc_ghosttown = new Location();
loc_ghosttown.zoom = 0;
loc_ghosttown.id = "ghosttown";
loc_ghosttown.title = "Ghost Town";
loc_ghosttown.desc = ["You're a pilgrim in an unholy land. Living souls are not welcome here..."];
loc_ghosttown.x = -5;
loc_ghosttown.y = 14;

let allLocations = [secretplace1, blocker1, babblingStreams, grampsHouse, barneysShed, whodiddle, loc_oldemill, roccospub, loc_biggcity, loc_crossroads];

class Player {
    constructor(){
        this.id = "player";
        this.type = "player";
        this.name = "Default Name";
        this.x = 0;
        this.y = 0;
        this.range_map = 5; //this sets how many "overworld map" locations are accessible in the travel options menu
        this.range_town = 0.4; //this sets how many "local town map" locations are accessible in the travel options menu
        this.range_current = 5;
        this.loc_current = [];
        this.currentHealth = 15;
        this.maxHealth = 15;
        this.battleStreak = 0;
        this.hits = 0;
        this.hitPerc = 0;
        this.totalAttacks = 0;
        this.secrets = [];
        this.inCombat = false;
        this.prompt = "none";
        this.attack = 10;
        this.defense = 0;
    }
    setLocation(x,y){
        this.x = x;
        this.y = y;
    }
    getDistance(destination){
        return getDistance(destination);
    }
    getCardinalDirection(destination){
        return getCardinalDirection(destination);
    }
    getPointPathDistance(point, end, start = gameplayer){
        return pointDistanceFromLine(point, end, start);
    }
    addSecret(destinationLoc, secretLoc){
        this.secrets.push({loc: destinationLoc, secret: secretLoc});
        console.log("--Added secret!");
    }
    purgeSecrets(){
        this.secrets = [];
    }
}

//this is mostly used for the player, but it could be applied to the opponent as well. Not sure if there's a need...
function addToStreak(fighter, amount){
    //player can have a growing positive number, indicating a winning streak, or a negative number, which is a losing streak
    //once a player goes from miss to hit or vice versa, their streak resets to zero and goes the other direction
    if (amount > 0){ 
        //if the amount is positive, it's a hit, count it so the percentage tally can be updated
        fighter.hits++;
        //if the streak is negative, reset it to 0.
        if(fighter.battleStreak < 0) fighter.battleStreak = 0; 
        //Add it to the positive streak
        fighter.battleStreak += amount;
    }else if (amount < 0){
        //if the streak is positive, but the latest amount was less than 0, reset it to 0. 
        if(fighter.battleStreak > 0) fighter.battleStreak = 0; 
        //Add it to the negative streak
        fighter.battleStreak += amount;
    }
        
    fighter.totalAttacks++;
    fighter.hitPerc = (fighter.hits/fighter.totalAttacks)*100;
    //console.log(`*******${fighter.title}`);
    //console.log(`---Hit Streak: ${fighter.battleStreak} ---Hit Percentage: ${fighter.hitPerc}%`);
}

let gameplayer = new Player();


//NEW CANVAS CODE FOR MAP GENERATION
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
//console.log(`MAP CANVAS CONTEXT: ${ctx}`); // CanvasRenderingContext2D { /* … */ }
let drag = false;
let dragStart = {};
let dragEnd = {};
let mouse = {x: 0, y: 0, down: false};

const map = {
	fontScale: [],
	unitSize: 50,
	unitScale: 0.7,
	maxScale: 2,
	minScale: 0.1,
	offsetX: canvas.width/2,
	offsetY: (canvas.height/2),
    closeBtn: {x:10, y:30, w:50, h:50},
	calibrate: function(){
		//console.log("CALIBRATING UNIT SCALE: " + this.unitScale);
		this.offsetX = canvas.width/2;
		this.offsetY = canvas.height/2;
	},
	convert: function(num, unitScale = this.unitScale){
		//console.log(`Using ${num} and multiplying by ${this.unitSize}, then mult by ${unitScale}`);
		return ((num*this.unitSize)*this.unitScale);
	}
};

let treeTypes = [
	{x:236, y:69, w:63 , h:73, perc:0.5},
	{x:302, y:69, w:63 , h:73, perc:0.5},
	{x:370, y:71, w:63 , h:73, perc:0.5}
];

let trees = [{x:1,y:2,t:0},{x:-2,y:4,t:1},{x:-4,y:2,t:0}]

function generateTree(img, locObj){
	let treeImg = treeTypes[locObj.t];
	let x = map.convert(locObj.x)+map.offsetX;
	let y = map.convert(locObj.y)+map.offsetY;

	let iconWidth = (treeImg.w*treeImg.perc)*map.unitScale;
	let iconHeight = (treeImg.h*treeImg.perc)*map.unitScale;
	//console.log(`Drawing image for ${locObj.name}: ${x},${y}`);
	ctx.beginPath();
	ctx.drawImage(img, treeImg.x, treeImg.y, treeImg.w, treeImg.h, x-(iconWidth/2), y-(iconHeight+13), iconWidth, iconHeight);
	
}

function draw(zoom) {
	map.unitScale = zoom;
	//console.log("---SO THIS IS NOW: " + map.unitScale + "  " + zoom);


	if (canvas.getContext) {
		//let ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const img = new Image(736,2025);

		//img.crossOrigin = "anonymous";
		img.src = `${imgpath}mapicons.png`;
		//img.src = `./imgs/fantasy-icons-transparentBG.png?v=${Math.round(Math.random()*10000000)}`;

		img.addEventListener("load", () => {
			//drawImage(image, sX, sY, sWidth, sHeight, dx, dy, dWidth, dHeight)
			//img.style.display = "none";
			//console.log("----image loaded: " + img.src);
			trees.forEach(tree =>{
				generateTree(img, tree);
			})
            
			for(i=0;i<allLocations.length;i++){
                if(allLocations[i].terrain < 1){
                   drawLocation(ctx, img, map, allLocations[i]);
                }
			}
			
			//drawPlayerLocation(ctx, map, gameplayer);
            drawPlayerLocation(ctx, map, travelManager.currentLocation);

		});
		ctx.fillStyle = "rgb(200, 0, 0)";
		ctx.fillRect(map.closeBtn.x, map.closeBtn.y, map.closeBtn.w, map.closeBtn.h);

		//ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
		//ctx.fillRect(30, 30, 50, 50);

		//console.log(`width: ${canvas.width} height: ${canvas.height}`);
	}else{
        console.log("ERROR - MAP NOT GETTING CONTEXT");
    }
}
		
function drawLocation(ctx, img, map, locObj){
    //console.log("---draw Location!!!");
	//let x = ((locObj.x*map.unitSize)*map.unitScale)+map.offsetX;
	//let y = ((locObj.y*map.unitSize)*map.unitScale)+map.offsetY;
    let x = locObj.x;
    let y = locObj.y * -1;
    
	x = map.convert(x)+map.offsetX;
	y = map.convert(y)+map.offsetY;
    //console.log(`---${locObj.title} - Was: (${locObj.x},${locObj.y}) Now: (${x},${y})`);

	let iconWidth = (locObj.mapImg.width*locObj.mapImg.perc)*map.unitScale;
	let iconHeight = (locObj.mapImg.height*locObj.mapImg.perc)*map.unitScale;
	//console.log(`Drawing image for ${locObj.name}: ${x},${y}`);
	ctx.beginPath();
	//draw the map plot point
	ctx.arc(x, y, 4, 0, Math.PI * 2, true);
	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	ctx.fill();
    
	//draw the image
	ctx.drawImage(img, locObj.mapImg.sX, locObj.mapImg.sY, locObj.mapImg.width, locObj.mapImg.height, x-(iconWidth/2), y-(iconHeight+13), iconWidth, iconHeight);
    
	ctx.font = "0.5em caption";
	if(locObj.title.length > 0){
	   ctx.fillText(locObj.title, x - 6, y-6);
	}
}
		
function drawPlayerLocation(ctx, map, player){
	let x = map.convert(player.x)+map.offsetX;
	let y = map.convert(player.y * -1)+map.offsetY;
    //console.log(`Player Location - Was: (${player.x},${player.y}) Now: (${x},${y})`);
	
	ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2, true);
	ctx.fillStyle = "rgba(255, 0, 0, 1)";
	ctx.fill();

	ctx.beginPath();
	ctx.setLineDash([4, 10]);
	ctx.strokeStyle = "rgba(255, 0, 0, 1)";
	ctx.arc(x, y, map.convert(travelManager.range), 0, Math.PI * 2, true);
    //ctx.arc(x, y, map.convert(player.range_current), 0, Math.PI * 2, true);
	ctx.stroke();
}

function displayWindowSize(){
	//canvas = document.getElementById("tutorial");
    // Get width and height of the window excluding scrollbars
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
	
	canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
	map.calibrate();

    // Redraw everything after resizing the window
    draw(map.unitScale); 
    
    // Display result inside a div element
    //console.log(`Width: ${canvas.width}, Height: ${canvas.height}`);
}
    
// Attaching the event listener function to window's resize event
window.addEventListener("resize", displayWindowSize);
//window.addEventListener("wheel", function(event){
//	console.info(event.deltaY);
//	if(event.deltaY > 0){
//		if((map.unitScale - 0.1) < map.maxScale){
//		   draw(map.unitScale - 0.1);
//		}
//		
//	}else{
//		if((map.unitScale + 0.1) > map.minScale){
//			draw(map.unitScale + 0.1);
//		}
//	}
//	
//});

//NEW EXPERIMENTAL STUFF BELOW

canvas.addEventListener("touchstart", function (e) {
	//console.log("touchstart");
	mousePos = getTouchPos(canvas, e);
	var touch = e.touches[0];
	var mouseEvent = new MouseEvent("mousedown", {
		clientX: touch.clientX,
		clientY: touch.clientY
	});
	canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("mousedown", function(e) {
    let el = document.getElementById("content_wrapper");
    let adjustment = e.pageY-window.scrollY;
    
	mouse.down = true;
	mouse.x = e.pageX;
    if(adjustment > 0){
       mouse.y = adjustment;
    }else{
       mouse.y = e.pageY;
    }
    //console.log(`mousedown: (${mouse.x},${mouse.y})`);
	
});

canvas.addEventListener("touchend", function (e) {
	//console.log("touchend");
	var mouseEvent = new MouseEvent("mouseup", {});
	canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("mouseup", function(e) {
	console.log("*******mouseup");
	mouse.down = false;
    //let isClose = pnpoly( 4, [map.closeBtn.x,50,10,50], [map.closeBtn.y,10,50,50], mouse.x, mouse.y )
    let isClose = pnpoly2( [{x:map.closeBtn.x, y:map.closeBtn.y},{x:map.closeBtn.x+map.closeBtn.w, y:map.closeBtn.y},{x:map.closeBtn.x+map.closeBtn.w, y:map.closeBtn.y+map.closeBtn.h},{x:map.closeBtn.x, y:map.closeBtn.y+map.closeBtn.h}], mouse);
    if(isClose){
       //console.log("---CLOSE BUTTON CLICKED - HIDING MAP");
       mapDisplay.style.visibility = 'hidden';
    }else{
        //console.log("---CLOSE BUTTON NOT CLICKED - KEEPING MAP UP");
    }
});

canvas.addEventListener("touchmove", function (e) {
	//console.log("touchmove");
	var touch = e.touches[0];
	var mouseEvent = new MouseEvent("mousemove", {
		clientX: touch.clientX,
		clientY: touch.clientY
	});
	canvas.dispatchEvent(mouseEvent);
}, false);

canvas.addEventListener("mousemove", function(e) {
	//console.log("mousemove");
	if(mouse.down){
	   //console.log("DRAWING " + e.pageX + ","+e.pageY);
		//ctx.translate(e.pageX, e.pageY);
		//ctx.translate((e.pageX-mouse.x), (e.pageY-mouse.y));
		map.offsetX += (e.pageX-mouse.x);
		map.offsetY += (e.pageY-mouse.y);
		mouse.x = e.pageX;
	    mouse.y = e.pageY;
		
		draw(map.unitScale);
	}
});

// Prevent scrolling when touching the canvas
document.body.addEventListener("touchstart", function (e) {
  if (e.target == canvas) {
    try{
        e.preventDefault();
    }catch(e){
        console.log("map error");
    }
    
  }
}, false);
document.body.addEventListener("touchend", function (e) {
  if (e.target == canvas) {
    try{
        e.preventDefault();
    }catch(e){
        console.log("map error");
    }
  }
}, false);
document.body.addEventListener("touchmove", function (e) {
  if (e.target == canvas) {
    try{
        e.preventDefault();
    }catch(e){
        console.log("map error");
    }
  }
}, false);

// Get the position of a touch relative to the canvas
function getTouchPos(canvasDom, touchEvent) {
	var rect = canvasDom.getBoundingClientRect();
	return {
		x: touchEvent.touches[0].clientX - rect.left,
		y: touchEvent.touches[0].clientY - rect.top
	};
}

//function that detects if a mouse click is within an area of a polygon
//nvert = num of vertices that the polygon has
//vertx = array of each vertex's X coordinates
//verty = array of each vertex's Y coordinates
//testPointX, testPointY = the coordinates of the point you want to see if it's inside the polygon 
//ex: pnpoly( 4, [map.closeBtn.x,50,10,50], [map.closeBtn.y,10,50,50], mouse.x, mouse.y )
function pnpoly( nvert, vertx, verty, testPointX, testPointY ) {
    var i, j, c = false;
    for( i = 0, j = nvert-1; i < nvert; j = i++ ) {
        if( ( ( verty[i] > testPointY ) != ( verty[j] > testPointY ) ) &&
            ( testPointX < ( vertx[j] - vertx[i] ) * ( testPointY - verty[i] ) / ( verty[j] - verty[i] ) + vertx[i] ) ) {
                c = !c;
        }
    }
    //console.log(`Is point(${mouse.x},${mouse.y}) within the polygon? ${c}`);
    return c;
}

//recoded version of above function to help make its use a little more intuitive
//pnpoly2( [{x:map.closeBtn.x, y:map.closeBtn.y},{x:map.closeBtn.x+map.closeBtn.w, y:map.closeBtn.y},{x:map.closeBtn.x+map.closeBtn.w, y:map.closeBtn.y+map.closeBtn.h},{x:map.closeBtn.x, y:map.closeBtn.y+map.closeBtn.h}], mouse)
function pnpoly2(vertArray, testPoint) {
    var nvert = vertArray.length;
    var testPointX = testPoint.x; 
    var testPointY = testPoint.y; 
    var text = "";
    var i, j, c = false;
    for( i = 0, j = nvert-1; i < nvert; j = i++ ) {
        text += ` (${vertArray[i].x},${vertArray[i].y})`;
        if( ( ( vertArray[i].y > testPointY ) != ( vertArray[j].y > testPointY ) ) &&
            ( testPointX < ( vertArray[j].x - vertArray[i].x ) * ( testPointY - vertArray[i].y ) / ( vertArray[j].y - vertArray[i].y ) + vertArray[i].x ) ) {
                c = !c;
        }
    }
    //console.log(`PNPOLY2: ${text}`);
    //console.log(`PNPOLY2: Is point(${mouse.x},${mouse.y}) within the polygon? ${c}`);
    return c;
}


displayWindowSize();
