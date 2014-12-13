/*global alert: false, confirm: false, console: false, Debug: false, opera: false, prompt: false, WSH: false */
/*jslint regexp: true */
if (!String.prototype.supplant) { // credit to Crockford for this supplant function
  String.prototype.supplant = function (o) {
    return this.replace(
      /\{([^{}]*)\}/g,
      function (a, b) {
        var r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      }
    );
  };
}

if (!Function.prototype.bind) { // credit to Crockford for this bind function  
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function () {},
      fBound = function () {
        return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
          aArgs.concat(Array.prototype.slice.call(arguments)));
      };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}

var GameApp = function () { // current function object constructor  
  this.init(); // initialise game, this refers to the new instance of GameApp 
};

GameApp.RESULT = {};
GameApp.RESULT.TIE = "tie";
GameApp.RESULT.USER_WON = "you win";
GameApp.RESULT.COMPUTER_WON = "computer wins";

GameApp.CHOICE = {};
GameApp.CHOICE.ROCK = "rock";
GameApp.CHOICE.PAPER = "paper";
GameApp.CHOICE.SCISSORS = "scissors";
GameApp.CHOICE.LIZARD = "lizard";
GameApp.CHOICE.SPOCK = "Spock";

GameApp.SCORE = {};
GameApp.SCORE[GameApp.CHOICE.ROCK] = [GameApp.CHOICE.SCISSORS, GameApp.CHOICE.LIZARD];
GameApp.SCORE[GameApp.CHOICE.PAPER] = [GameApp.CHOICE.ROCK, GameApp.CHOICE.SPOCK];
GameApp.SCORE[GameApp.CHOICE.SCISSORS] = [GameApp.CHOICE.PAPER, GameApp.CHOICE.LIZARD];
GameApp.SCORE[GameApp.CHOICE.LIZARD] = [GameApp.CHOICE.PAPER, GameApp.CHOICE.SPOCK];
GameApp.SCORE[GameApp.CHOICE.SPOCK] = [GameApp.CHOICE.ROCK, GameApp.CHOICE.SCISSORS];

GameApp.prototype = { // current prototype member of the GameApp object constructor
  gameJSON: { // JSON: data-interchange text format to describe game data
    ties: 0,
    wins: 0,
    defeats: 0,
    turns: 1,
    maxTurns: -1
  },
  //empty elements by setting them to null 
  loseElem: null,
  resultElem: null,
  selectElem: null,
  startElem: null,
  tiesElem: null,
  winElem: null,
  gameTemplate: "<tr><td>{turn}</td><td>{user}</td><td>{computer}</td><td>{result}</td></tr>", // current game template    

  init: function () {
    var id, source;
    this.loseElem = document.getElementById("lose"); // bind UI 
    this.resultElem = document.getElementById("results");
    this.selectElem = document.getElementById("selectors");
    this.startElem = document.getElementById("start");
    this.tiesElem = document.getElementById("tie");
    this.winElem = document.getElementById("win");

    this.startElem.onclick = function () { // bind events 
      this.startGame(); // inner function doesn't get to the outer function's this, to make this available call bind(this);
    }.bind(this);

    this.selectElem.onclick = function (e) { // events keep bubbling up from parent to parent until it is handled 
      e = e || event;
      source = e.selectElem || e.target;
      id = source.getAttribute("id"); // current value of the id attribute of element   
      this.checkForWinner(id);
    }.bind(this);
  },

  startGame: function () {
    var turns;
    turns = prompt("Best of how many games do you want to play?"); // decide number of turns in a game
    if (isNaN(turns)) {
      alert("invalid choice!");
      return;
    }
    this.gameJSON = { // reset gameJSON based on number of turns
      ties: 0,
      wins: 0,
      defeats: 0,
      turns: 1,
      maxTurns: -1
    };

    turns = parseInt(turns, 10);
    this.gameJSON.maxTurns = turns;

    this.resultElem.innerHTML = "";
    this.selectElem.style.display = "block";
    this.tiesElem.innerHTML = "0";
    this.winElem.innerHTML = "0";
    this.loseElem.innerHTML = "0";
  },

  getComputerchoice: function () {
    var choice, moves; //current computer choice 
    choice = Math.floor(Math.random() * 5);  // random numbers from 0 to 4
    moves = [GameApp.CHOICE.ROCK, GameApp.CHOICE.PAPER, GameApp.CHOICE.SCISSORS, GameApp.CHOICE.LIZARD, GameApp.CHOICE.SPOCK];
    return moves[choice]; //accessing moves array via random index numbers
  },
  
  //display final score
  showScores: function (result, user, computer) {
    var resultObj;
    resultObj = { // current game record  
      turn: this.gameJSON.turns,
      user: user,
      computer: computer,
      result: result
    };
    
    this.gameJSON.turns += 1; // increment number of turns
    if (result === "tie") {
      this.gameJSON.ties += 1;
      this.tiesElem.innerHTML = this.gameJSON.ties;
    } else if (result === "you win") {
      this.gameJSON.wins += 1;
      this.winElem.innerHTML = this.gameJSON.wins;
    } else if (result === "computer wins") {
      this.gameJSON.defeats += 1;
      this.loseElem.innerHTML = this.gameJSON.defeats;
    }
    this.resultElem.innerHTML = this.resultElem.innerHTML + this.gameTemplate.supplant(resultObj); // blast resultObj data to template
    // once the player plays the number of turns specified, hide game selectors
    if (this.gameJSON.maxTurns !== -1 && this.gameJSON.turns > this.gameJSON.maxTurns) {
      this.selectElem.style.display = "none";
    }
  },

  checkForWinner: function (user) {
    var computer, movesComputerLoses, movesUserBeats; // current computer choice  
    computer = this.getComputerchoice();
    //pair-programmed with Tom from Hacker School to re-factor the below code from if statements to using an arrray and Array.prototype.indexof() 
    if (user === computer) {
      return this.showScores(GameApp.RESULT.TIE, user, computer);
    }
    movesUserBeats = GameApp.SCORE[user];
    movesComputerLoses = movesUserBeats.indexOf(computer);
    if (movesComputerLoses !== -1) {
      return this.showScores(GameApp.RESULT.USER_WON, user, computer);
    }
    return this.showScores(GameApp.RESULT.COMPUTER_WON, user, computer);
  }
};

var rockPaperSci = new GameApp(); // a new constructor that returns the current instance of GameApp