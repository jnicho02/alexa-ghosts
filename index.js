'use strict';

const Alexa = require('alexa-sdk');

module.exports.handler = (event, context, callback) => {
  const alexa = Alexa.handler(event, context);
  alexa.appId = process.env.APP_ID;
  alexa.dynamoDBTableName = "alexa-ghost";
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'LaunchRequest': function() {
    var speechOutput = `Welcome to ghost hunt`;
    var reprompt = ``;
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
  'AnybodyThereIntent': function() {
    var speechOutput = ``;
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
