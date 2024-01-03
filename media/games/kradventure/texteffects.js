//https://codepen.io/zerospree/pen/GRmBga
function runJitter(eleRef){
    let el = document.querySelectorAll(eleRef);
  let lastEl = el[el.length-1];
  let $jittery = lastEl.textContent,
      aText    = $jittery.split(''),
      letters = '';
  
  for(var i = 0; i < aText.length; i++){
    letters += '<span>'+aText[i]+'</span>';
  }
  
  $jittery.empty().append(letters);
  
  $.each($('span', $jittery), function(i){
    $(this).css('animation-delay', '-'+i+'70ms');
  });
};


//function runTextEffect(el){
//    //console.log("----TESTING 10/02");
//    console.log(`Element is: ${el.textContent}`);
//    let classname = 'spelltext';//this could be anything, we are only adding it to one piece of text at a time, then removing the class
//    let txt = el.textContent;
//    let isTypeItSupported = false; // assume false until browser test works below
//    
//    /*
//    the split array is created using the "|" character and the use of "|" assumes that multiple effects need to be applied to the text
//    if no "|" is used, the split array should just have one element consisting of the whole text
//    */
//    var split = el.textContent.split("|");
//    let tsplit;
//    let textPiece = '';
//    let totalText = '';
//    let overwriteTotalText = false;
//    let currentSplitPiece = 0;
//    
//    
//    //make a test element to use with the TypeIt code and see if browser supported
//    let d = document.createElement('div');
//    d.classList.add('testclass');
//    d.innerHTML = '';
//    document.querySelector('#content').appendChild(d);
//    d.style.display = 'none';
//    
//    try{
//        let test = new TypeIt(`.testclass`, { speed: 500, lifeLike: false }).go();
//        console.log("SUCCESS RUNNING TYPEIT CODE");
//        isTypeItSupported = true;
//        
//    }catch(e){
//        console.log("ERROR RUNNING TYPEIT CODE");
//    }
//    document.querySelector('#content').removeChild(d);
//    
//    if(isTypeItSupported){
//        el.innerHTML = '';
//        
//        el.classList.add(classname);
//        
//        //create the one TypeIt instance we need to run these effects
//        let instance = new TypeIt(`.${classname}`, {
//            speed: 50,
//            cursorSpeed:500,
//            strings:'',
//            //hide the list of choices until the text effect is done
//            beforeString: () => {
//                displayChoiceList('none');
//            },
//            afterComplete: () => {
//                //this function fires after a portion of text has had an effect applied to it
//                //the currentSplitPiece var keeps track of how many portions of text have been completed
//                currentSplitPiece++;
//                //console.log(`---done typing piece ${currentSplitPiece}/${split.length}`);
//                el.classList.remove(classname);
//                if(currentSplitPiece > split.length-2){
//                   displayChoiceList('block');
//                }
//            }
//        }).go();
//        
//        //this event listener allows the player to click on the text and skip through the effects
//        document.querySelector('#content_wrapper').addEventListener("click", function(){
//            //console.log("------clicky clicky!");
//            instance.freeze(); //stops the typing effect
//            //wait a fraction of a second for the typing effect to stop, then fill in all the text
//            setTimeout(()=>{
//                el.innerHTML = txt;    // fills the word bubble with all text, including the special characters for Type Effects
//                removeTypeEffects(el); // removes the special characters for Type Effects
//                displayChoiceList('block');
//            }, 200);
//            
//        });
//        
//        /*
//        if split.length = 1, then no "|" should have been found, therefore, no special TypeIt effects (other than the basic one) will be needed 
//        */
//        if(split.length > 1){
//            split.forEach((t,i) =>{
//                //console.log("---part of split: " + split[i]);
//                instance.reset();
//                //pause effect
//                if(t.includes('#')){
//                    tsplit = t.split('#');
//                    instance.pause(tsplit[0]).type(tsplit[1]).go();
//                //speed change effect
//                }else if(t.includes('$')){
//                    tsplit = t.split('$');
//                    instance.options({speed:tsplit[0], lifeLike: false}).type(tsplit[1]).go();
//                    //instance.type(tsplit[1]).go();
//                //backspace effect
//                }else if(t.includes('*')){
//                    tsplit = t.split('*');
//                    console.log(`---BACKSPACING ${tsplit[1].length} spaces to delete '${tsplit[1]}'`);
//                    instance.pause(1000).go();
//                    instance.delete(tsplit[1].length, {speed:1000}).go();
//                //move cursor without deleting effect
//                }else if(t.includes('~')){
//                    tsplit = t.split('~');
//                    
//                    let amount = parseInt(tsplit[0]);
//                    console.log(`---MOVING BACK ${amount} spaces`);
//                    instance.move(10).go();
//                    //instance.type(tsplit[1]).go();
//                }else if(t.includes('>')){
//                    tsplit = t.split('>');
//                    let amount = parseInt(tsplit[0]);
//                    instance.move(amount).type(tsplit[1]).go();
//                }else if(t.includes('^')){
//                    tsplit = t.split('^');
//                    //console.log("---adding text effect: " + tsplit[0]);
//                    instance.exec(() => {
//                        el.classList.add(tsplit[0]);
//                    }).go();
//                }else{
//                    //instance.type(t).go();
//                    typeSentence(t, '.characterbox', 50);
//                }
//
//            });
//        }else{
//            //console.log("No '|' characters found to divide text. " + split[0]);
//            instance.reset();
//            instance.type(split[0]).go();
//        }
//        
//        instance.destroy();
//        
//    }else{
//        removeTypeEffects(el);
//    }
//    
//    
//}

let effectQueue = [];
let effectController = {active:true};
let currentSpeed = 50;
let isTyping = false;

function runTextEffect2(txt){
    //console.log("----TESTING 10/02");
    /*
    the split array is created using the "|" character and the use of "|" assumes that multiple effects need to be applied to the text
    if no "|" is used, the split array should just have one element consisting of the whole text
    */
    var split = txt.split("|");
    let tsplit;
    let textPiece = '';
    let overwriteTotalText = false;
    let currentSplitPiece = 0;
    let currentSpeed = 50;
    //let txt = txt.textContent;
    
    //the idea here is to hide the choices until the text is finished, but maybe disable this until we have a reliable way of skipping the animation
    //displayChoiceList('none');
       
    /*
    if split.length = 1, then no "|" should have been found, therefore, no special TypeIt effects (other than the basic one) will be needed 
    */
    console.log(`---LENGTH: ${split.length}`);
    effectController.active = true;
    if(split.length > 1){
        split.forEach((t,i) =>{
            console.log("--pushing effect");
            effectQueue.push(t);
        });
        nextInQueue();
    }else{
        typeSentence(txt, '.characterbox', currentSpeed);
    }
}

async function runSingleEffect(t){
        //console.log("----runSingleEffect");
        //pause effect
        if(t.includes('#')){
            let tsplit = t.split('#');

            console.log(`----runSingleEffect: pause`);
            //instance.pause(tsplit[0]).type(tsplit[1]).go();
            await waitForMs(tsplit[0]);
            typeSentence(tsplit[1], '.characterbox', currentSpeed);

        //speed change effect
        }else if(t.includes('$')){
            let tsplit = t.split('$');
            console.log("----runSingleEffect: change speed");
            typeSentence(tsplit[1], '.characterbox', tsplit[0]);
        //backspace effect
        }else if(t.includes('*')){
            let tsplit = t.split('*');
            console.log(`----runSingleEffect: backspace ${tsplit[1].length} spaces to delete '${tsplit[1]}`);
            await waitForMs(1000);
            deleteSentence('.characterbox', tsplit[1]);

        //move cursor without deleting effect
        }else{

            //instance.type(t).go();
            console.log(`----runSingleEffect: typing ${t}`);
            typeSentence(t, '.characterbox', currentSpeed);
        }
}

//just like the runTextEffects function, this function checks the special characters to see what effects WOULD have been applied,
//however this function is re-assembling the text and removing all special characters, as if it was a plain, boring piece of text.
function removeTypeEffects(txt){
    console.log("-----REMOVING TYPE EFFECTS");
    let split = txt.split("|");
    let tsplit = [];
    let assembledText = '';
    let overwriteTotalText = false;
    let textPiece = '';
    
    //clear the queue so no further array elements cause the nextInQueue()
    effectQueue = [];
    effectController.active = false;
    
    //only go through the search of special characters if the text has been split up
    //otherwise, don't bother and leave it alone
    if(split.length > 1){
        split.forEach((t,i) =>{
            //console.log("---part of split: " + i);
            if(t.includes('#')){
                tsplit = t.split('#');
                textPiece = tsplit[1];

            }else if(t.includes('$')){
                tsplit = t.split('$');
                textPiece = tsplit[1];

            }else if(t.includes('*')){
                tsplit = t.split('*');
                //get the word to delete and trim any white space
                let txtToReplace = tsplit[1].trim();
                //find the word in the assembledText and replace with blank
                let newText = assembledText.replace(txtToReplace, '');
                //replace existing text with modified text
                assembledText = newText;
                //set to true so this part of the text isn't appended
                overwriteTotalText = true;

            }else if(t.includes('<')){
                tsplit = t.split('<');
                let amount = parseInt(tsplit[0]);

            }else if(t.includes('>')){
                tsplit = t.split('>');
                let amount = parseInt(tsplit[0]);

            }else if(t.includes('^')){
                tsplit = t.split('^');
                //console.log("---adding text effect: " + tsplit[0]);

            }else{
                textPiece = t;
            }
            /*
            this checks to see if we're appending corrected text to a larger block of text
            or just setting the overwriteTotalText var back to false, because the correction 
            was already made in a more complicated way!
            */
            if(!overwriteTotalText){
               assembledText += textPiece;
            }else{
               overwriteTotalText = false; 
            }

            //console.log("----SO FAR: " + assembledText);
        });
    }else{
        assembledText = split[0];
    }

    //txt.innerHTML = assembledText;
    console.log(`-----RESULT: ${assembledText}`);
    return assembledText;
}

function displayChoiceList(cssSetting = 'block'){
    //console.log("------displayChoiceList");
    let choiceList = document.querySelectorAll('.options');
    let lastChoiceList = choiceList[choiceList.length-1];
    lastChoiceList.style.display = cssSetting;
}

//experimental basic typing effect using async and Promises
async function typeSentence(sentence, eleRef, speed = 50, controller = effectController) {
  let el = document.querySelectorAll(eleRef);
  let lastEl = el[el.length-1];
  let letters = sentence.split("");
  let i = 0;
  while(i < letters.length) {
      if(controller.active){
         await waitForMs(speed);
         lastEl.append(letters[i]);
         i++
      }else{
        //letters = [];
        return;  
      }
  }
  //console.log("END OF TYPING");
  nextInQueue();
  return;
}

async function deleteSentence(eleRef, textToDelete) {
  let el = document.querySelectorAll(eleRef);
  let lastEl = el[el.length-1];
  const sentence = lastEl.innerHTML;
  const letters = sentence.split("");
  let i = 0;
  let stopPoint = sentence.lastIndexOf(textToDelete.trim());
  console.log(`Sentence is ${sentence}, the phrase '${textToDelete}' is at ${stopPoint}`);
  if(stopPoint > -1){
    while(letters.length > stopPoint) {
        await waitForMs(50);
        letters.pop();
        lastEl.innerHTML = letters.join("");
    }
  }
  //console.log("END OF BACKSPACING");
  nextInQueue();
}


function waitForMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function nextInQueue(){
    var nextEffect = effectQueue.shift(); 
    if(nextEffect) { 
        isTyping = true;
        runSingleEffect(nextEffect);
        //console.log("----running next function in queue");
    }else{
        isTyping = false;
        document.querySelector('#content').dispatchEvent(new CustomEvent('endtypeevent'));
    }
    
}
