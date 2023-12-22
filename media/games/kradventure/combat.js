const combatManager = {
    player: {},
    opponent: {},
    init: function(p, o){
        this.player = p;
        this.opponent = o;
    },
    startRound: function(p, o){
        
    },
    resolveRPSCombat: function(playerchoice, characterchoice){
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
    
    
    
    
    
    
};