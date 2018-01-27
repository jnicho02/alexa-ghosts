'use strict';

const Alexa = require('alexa-sdk');

const the_skiff = {
  "door": {
    "ghostliness": 0,
    "links": "kitchen, sprint plan"
  },
  "kitchen": {
    "ghostliness": 10,
    "links": "door"
  },
  "sprint plan": {
    "ghostliness": 5,
    "links": "door"
  }
};

module.exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = process.env.APP_ID;
  alexa.dynamoDBTableName = "alexa-ghost";
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'LaunchRequest': function() {
    var speechOutput = `Welcome to ghost hunt.`;
    var reprompt = `Where are you right now?`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Launch`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('LaunchRequest', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'WhereAreYouIntent': function() {
    var speechOutput = ``;
    var reprompt = ``;
    var slotValues = getSlotValues(this.event.request.intent.slots);
    if (slotValues['place_or_thing']['resolved'] !== undefined) {
      this.event.session.attributes['location'] = slotValues['place_or_thing']['resolved'];
      if (this.event.session.attributes['location'] === 'skiff') {
        speechOutput = `Ah, I meant whereabouts in the skiff.`;
        reprompt = `Where exactly are you?`;
      } else if (the_skiff[this.event.session.attributes['location']] === undefined ) {
        speechOutput = `I am not sure where ${this.event.session.attributes['location']} is. Say again?`;
        reprompt = `Where exactly are you?`;
      } else {
        speechOutput = `Ah, you are near the ${slotValues['place_or_thing']['resolved']}`;
        var currentRoom = the_skiff[this.event.session.attributes['location']];
        if (currentRoom['ghostliness'] < 5) {
          speechOutput = `${speechOutput}. I am not detecting much spirit activity.`;
          var links = currentRoom['links'].split(",");
          speechOutput = `${speechOutput}. Try moving toward the ${links[random(links.length)]}.`;
        } else if (currentRoom['ghostliness'] < 7) {
          speechOutput = `${speechOutput}. I am not detecting some spirit activity.`;
          speechOutput = `${speechOutput}. Try asking if anybody is there, or move toward the ${currentRoom['links']['one']}.`;
        } else if (currentRoom['ghostliness'] <= 10) {
          speechOutput = `${speechOutput}. There is very strong spirit activity.`;
          speechOutput = `${speechOutput}. Try asking if anybody is there.`;
        }
      }
    } else {
      speechOutput = `I didn't get that`;
    }
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Launch`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('WhereAreYouIntent', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'AnybodyThereIntent': function() {
    var speechOutput = ``;
    if (this.event.session.attributes['location'] === undefined || this.event.session.attributes['location'] === 'skiff') {
      speechOutput = `I need to know where you are. Where are you near?`;
    } else {
      switch (random(5)) {
        case 1:
          speechOutput = `The spirits are there. Try again`;
          break;
        case 2:
          speechOutput = `I am not sure. Try again`;
          break;
        case 3:
          speechOutput = `${mp3("creepy")}`;
          break;
        case 4:
          speechOutput = `${mp3("i see dead people")}`;
          break;
        case 5:
          speechOutput = `${mp3("creepy")}`;
          break;
      }
    }
    var reprompt = ``;
    speechOutput = `${speechOutput} ${reprompt}`;
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
    var speechOutput = `This is the Ghost Story.`;
    var reprompt = `Say hello, to hear me speak.`;
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
    // handle any intent in interaction model with no handler code
    var speechOutput = `This is the Ghost Story. `;
    var reprompt = `I did not understand.`;
    speechOutput = `${speechOutput} ${reprompt}`;
    var cardTitle = `Unhandled`;
    var cardContent = speechOutput;
    var imageObj = undefined;
    log('Unhandled', speechOutput, reprompt, cardTitle, cardContent, imageObj);
    this.response.speak(speechOutput)
      //      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function() {
    // "exit", timeout or error. Cannot send back a response
    console.log(`Session ended: ${this.event.request.reason}`);
  },
};

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
