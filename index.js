'use strict';

const Alexa = require('alexa-sdk');
const rooms = require('./the-skiff');

module.exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = process.env.APP_ID;
  if (process.env.USE_DYNAMO_DB) {
    alexa.dynamoDBTableName = "alexa-ghost";
  }
  alexa.registerHandlers(lobbyMode, locateMode, findMode, speakMode);
  alexa.execute();
};

const lobbyMode = {
  'LaunchRequest': function() {
    var speechOutput = ``;
    if (this.event.session.attributes['location'] !== undefined) {
      speechOutput = `Oh sorry. I nodded off.
        I think we are in the ${this.event.session.attributes['location']}.
        `;
    } else {
      speechOutput = `Welcome to ghost hunt.
      I am a psychic medium device capable of tranmission to and from the spirit world.
      Move me around the location and I will detect and hopefully talk to ghosts.
      I am not normally mobile and cannot see.
      You will have to be my legs and eyes.
      `;
    }
    var reprompt = `Where are we right now?`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Launch`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('LaunchRequest', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.handler.state = "LOCATE";
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function() {
    var speechOutput = `This is the Ghost Hunt.`;
    var reprompt = `I cannot see. Where are we right now?`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Help`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('HelpIntent', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.emit('CompletelyExit');
  },
  'AMAZON.StopIntent': function() {
    this.emit('CompletelyExit');
  },
  'CompletelyExit': function() {
    this.event.session.attributes['location'] = undefined;
    var speechOutput = `Goodbye.`;
    var reprompt = null;
    var cardTitle = `Exit`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('CompletelyExit', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'Unhandled': function() {
    var speechOutput = `I did not understand. `;
    var reprompt = `Try that again, but maybe in a different way.`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Unhandled`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('Unhandled', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function() {
    // "exit", timeout or error. Cannot send back a response
    console.log(`Session ended: ${this.event.request.reason}`);
  },
};

//  WHERE ARE YOU?
const locateMode = Alexa.CreateStateHandler("LOCATE", {
  'WhereAreYouIntent': function() {
    var speechOutput = ``;
    var reprompt = ``;
    var slotValues = getSlotValues(this.event.request.intent.slots);
    if (slotValues['place_or_thing']['resolved'] !== undefined) {
      this.event.session.attributes['location'] = slotValues['place_or_thing']['resolved'];
      if (this.event.session.attributes['location'] === 'skiff') {
        speechOutput = `Ah, I meant whereabouts in the skiff. Where exactly in the skiff are we?`;
        reprompt = `Where exactly are we?`;
      } else if (rooms[this.event.session.attributes['location']] === undefined ) {
        speechOutput = `I am not sure where ${this.event.session.attributes['location']} is. Say again?`;
        reprompt = `Where exactly are we?`;
      } else {
        speechOutput = `Ah, we are near the ${slotValues['place_or_thing']['resolved']}`;
        var currentRoom = rooms[this.event.session.attributes['location']];
        if (currentRoom['ghostliness'] < 5) {
          var links = currentRoom['links'].split(",");
          speechOutput = `${speechOutput}.
            I am not detecting much spirit activity.
            Try moving toward the ${oneOfThe(links)}.
            Tell me when we are there.`;
          reprompt = `Where exactly are we?`;
        } else if (currentRoom['ghostliness'] < 7) {
          speechOutput = `${speechOutput}.
            I am detecting spirit activity.
            Try asking if anybody is there, or move toward the ${currentRoom['links']['one']}.
            If we move then say lets move.`;
          this.handler.state = "FIND";
        } else if (currentRoom['ghostliness'] <= 10) {
          speechOutput = `${speechOutput}.
            There is very strong spirit activity here.
            Try asking if anybody is there.`;
          this.handler.state = "FIND";
        }
      }
    } else {
      speechOutput = `I didn't get that. Where exactly are we?`;
      reprompt = `Where exactly are we?`;
    }
    var cardTitle = `Launch`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('WhereAreYouIntent', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function() {
    var speechOutput = `I cannot see and need to know where we are.
      Where are we?`;
    var reprompt = `Where are we?`;
    var cardTitle = `Help`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('HelpIntent', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.emit('CompletelyExit');
  },
  'AMAZON.StopIntent': function() {
    this.emit('CompletelyExit');
  },
  'CompletelyExit': function() {
//    this.event.session.attributes['location'] = undefined;
    var speechOutput = `Goodbye. We will restart where we left off.`;
    var reprompt = null;
    var cardTitle = `Exit`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('CompletelyExit', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'Unhandled': function() {
    var speechOutput = `I did not quite get that. `;
    var reprompt = `I did not understand.`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Unhandled`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('Unhandled', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function() {
    // "exit", timeout or error. Cannot send back a response
    console.log(`Session ended: ${this.event.request.reason}`);
  },
});


//  IS ANYBODY THERE?
const findMode = Alexa.CreateStateHandler("FIND", {
  'AnybodyThereIntent': function() {
    if (this.event.session.attributes['diceRolls'] === undefined){
      this.event.session.attributes['diceRolls'] = [];
    }
    var speechOutput = ``;
    var reprompt = ``;
    var diceRoll = random(3); // destined to fail first time
    while (this.event.session.attributes['diceRolls'].includes(diceRoll)) {
        diceRoll = random(6);
    };
    console.log(`rolled a ${diceRoll}`);
    this.event.session.attributes['diceRolls'].push(diceRoll);
    var direction = oneOfThe([
      "to the left a bit",
      "to the right a bit",
      "up in the air",
      "down low",
      "left and right",
      "in a circle",
      "randomly",
      "in a square pattern",
      "in the air",
    ]);
    console.log(`move ${direction}`);
    switch (diceRoll) {
      case 0:
        speechOutput = `I think I detected something. Move me to the left and ask again`;
        reprompt = `Move me ${direction} and say, is anybody there?`;
        break;
      case 1:
        speechOutput = `The spirits are there. Try again`;
        reprompt = `Move me ${direction} and say, is anybody there?`;
        break;
      case 2:
        speechOutput = `Some trace activity. Try again`;
        reprompt = `Move me ${direction} and say, is anybody there?`;
        break;
      case 3:
        speechOutput = `${mp3("creepy")}
          Did you hear that?
          Let's try to speak with it.`;
        reprompt = `Let's try to speak with it.`;
        this.event.session.attributes['diceRolls'] = [];
        this.handler.state = "SPEAK";
        break;
      case 4:
        speechOutput = `${mp3("i see dead people")}
          Did you hear that?
          Move me down toward the floor and try again.`;
        reprompt = `Move me down toward the floor and try again.`;
        break;
      case 5:
        speechOutput = `${mp3("aaagh1")}
          Shit. Did you hear that?
          Let's try to speak with it.`;
        reprompt = `Let's try to speak with it.`;
        this.event.session.attributes['diceRolls'] = [];
        this.handler.state = "SPEAK";
        break;
    }
    var cardTitle = `Is anybody there?`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('AnybodyThereIntent', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function() {
    var speechOutput = `We are trying to see if the spirits are willing to speak.`;
    var reprompt = `Say, is anybody there.`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Help`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('HelpIntent', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = "LOCATE";
  },
  'AMAZON.StopIntent': function() {
    this.handler.state = "LOCATE";
  },
  'Unhandled': function() {
    var speechOutput = `This is the Ghost Hunt.`;
    var reprompt = `I did not understand.`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Unhandled`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('Unhandled', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function() {
    // "exit", timeout or error. Cannot send back a response
    console.log(`Session ended: ${this.event.request.reason}`);
  },
});


//  LET'S SPEAK
const speakMode = Alexa.CreateStateHandler("SPEAK", {
  'AMAZON.HelpIntent': function() {
    var speechOutput = `We are trying to see if the spirits are willing to speak.`;
    var reprompt = `Shall I continue.`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Help`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('HelpIntent', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'AMAZON.YesIntent': function() {
    var speechOutput = ``;
    if (this.event.session.attributes['ghost'] === undefined) {
      speechOutput = `Oh spirit, are you willing to speak?
        Spirit, please talk, we beseach thee.`;
    }
    if (this.event.session.attributes['ghost'] !== undefined) {
      speechOutput = `Oh spirit, what is your name?
        Spirit, please talk, we beseach thee.
        ${mp3("cant-hear")}
        `;
    }
    this.event.session.attributes['ghost'] = 0;
    var reprompt = `Shall I continue.`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Oh spirit...`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('YesIntent', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'AMAZON.NoIntent': function() {
    this.handler.state = "LOCATE";
  },
  'AMAZON.CancelIntent': function() {
    this.handler.state = "LOCATE";
  },
  'AMAZON.StopIntent': function() {
    this.handler.state = "LOCATE";
  },
  'Unhandled': function() {
    var speechOutput = `
      We are transmitting to a spirit.
      Shall I try to speak to it?
    `;
    var reprompt = `Shall I try to speak to it?`;
    var cardTitle = `Unhandled`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('Unhandled', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function() {
    // "exit", timeout or error. Cannot send back a response
    console.log(`Session ended: ${this.event.request.reason}`);
  },
});


function log(intent, speechOutput, reprompt, cardTitle, cardContent, imageObj) {
  console.log(`${intent}: ${JSON.stringify({
    "speak": speechOutput,
    "listen": reprompt,
    "card" : {
      "title": cardTitle,
      "content": cardContent,
      "imageObj": imageObj
    }
  })}`);
}

function mp3(name) {
  return `<audio src='https://s3-eu-west-1.amazonaws.com/alexa-ghosts/${name.replaceAll(" ","-")}.mp3'/>`;
}

String.prototype.replaceAll = function(target, replacement) {
  return this.split(target).join(replacement);
};

function random(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

function oneOfThe(arrayOfThings) {
  return arrayOfThings[random(arrayOfThings.length)];
}

function getSlotValues(filledSlots) {
  //given event.request.intent.slots, a slots values object so you have
  //what synonym the person said - .synonym
  //what that resolved to - .resolved
  //and if it's a word that is in your slot values - .isValidated
  let slotValues = {};

  console.log('The filled slots: ' + JSON.stringify(filledSlots));
  Object.keys(filledSlots).forEach(function(item) {
    //console.log("item in filledSlots: "+JSON.stringify(filledSlots[item]));
    var name = filledSlots[item].name;
    //console.log("name: "+name);
    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {

      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case "ER_SUCCESS_MATCH":
          slotValues[name] = {
            "synonym": filledSlots[item].value,
            "resolved": filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            "isValidated": true
          };
          break;
        case "ER_SUCCESS_NO_MATCH":
          slotValues[name] = {
            "synonym": filledSlots[item].value,
            "resolved": filledSlots[item].value,
            "isValidated": false
          };
          break;
      }
    } else {
      slotValues[name] = {
        "synonym": filledSlots[item].value,
        "resolved": filledSlots[item].value,
        "isValidated": false
      };
    }
  }, this);
  //console.log("slot values: " + JSON.stringify(slotValues));
  return slotValues;
}
