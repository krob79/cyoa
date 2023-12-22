//***Music***
let audioQueue = [];
const audiopath = "./media/audio/";

function audioVolumeIn(q){
       q.volume = 0.1; //this has to be set to something other than 0
       if(q.volume){
          var InT = 0;
          var setVolume = 0.7; // Target volume level for new song
          var speed = 0.05; // Rate of increase
          q.volume = InT;
          var eAudio = setInterval(function(){
              InT += speed;
              q.volume = InT.toFixed(1);
              if(InT.toFixed(1) >= setVolume){
                 clearInterval(eAudio);
                 //alert('clearInterval eAudio'+ InT.toFixed(1));
              };
          },50);
       };
   };
   
function audioVolumeOut(q){
   if(q.volume){
      var InT = 0.4;
      var setVolume = 0;  // Target volume level for old song 
      var speed = 0.05;  // Rate of volume decrease
      q.volume = InT;
      var fAudio = setInterval(function(){
          InT -= speed;
          q.volume = InT.toFixed(1);
          if(InT.toFixed(1) <= setVolume){
             clearInterval(fAudio);
             callStopAndTransition();
             //alert('clearInterval fAudio'+ InT.toFixed(1));
          };
      },50);
   };
};

function callStopAndTransition(){
    console.log("----this audio is done and calling a function!!!");
    if(audioTracks.length > 1){
        audioTracks.splice(0,1);  
        console.log("AUDIO TRACKS: " + audioTracks);
        music.setAttribute('src',`${audiopath}${audioTracks[0]}`);
        //console.log(`Attempting to play Music: ${audiopath}${audioTracks[0]}`);
        music.play();
        audioVolumeIn(music);
    }
}

let music = document.createElement("audio");
let audioTracks = [];
music.addEventListener("loadeddata", function() {
    music.play();
});

let sfx = document.createElement("audio");
sfx.addEventListener("loadeddata", function() {
    sfx.play();
});

function loadAndPlaySFX(file){
    //console.log(`Attempting to play SFX: ${audiopath}${file}`);
    try{
        sfx.setAttribute('src',`${audiopath}${file}`); //change the source
        //music.load(); //load the new source
        sfx.play(); //play
    }catch(e){
        console.log(`--ERROR: ${file} was not found.`);    
    }
}

function loadAndPlayMusic(theNewSource){
    try{
        if(audioTracks.length < 1){
            audioTracks.push(theNewSource);
            //console.log(`---tracks are empty, loading and playing this track!`);
            music.setAttribute('src',`${audiopath}${theNewSource}`); //change the source
            //music.load(); //load the new source
            music.play(); //play
        }else{
            audioTracks.push(theNewSource);
            //console.log(`---there's already a track here...fading out current!`);
            //console.log("AUDIO TRACKS: " + audioTracks);
            audioVolumeOut(music);
        }
    }catch(e){
        console.log(`ERROR with loadAndPlayMusic: Couldn't find '${audiopath}${theNewSource}'`);
    }
    
}
