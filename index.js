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
    console.log(`LaunchRequest`);
    var speechOutput = 'This is the Ghost Story. ';
    var reprompt = 'Say hello, to hear me speak.';
    speechOutput = speechOutput + reprompt;
    var cardTitle = 'Help.';
    var cardContent = speechOutput;
    var imageObj = undefined;
    console.log(`HelpIntent: ${JSON.stringify({
      "speak": speechOutput,
      "listen": reprompt,
      "card" : {
        "title": cardTitle,
        "content": cardContent,
        "imageObj": imageObj
      }
    })}`);
    this.response.speak(speechOutput)
      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent': function() {
    var speechOutput = 'This is the Ghost Story. ';
    var reprompt = 'Say hello, to hear me speak.';
    speechOutput = speechOutput + reprompt;
    var cardTitle = 'Help.';
    var cardContent = speechOutput;
    var imageObj = undefined;
    console.log(`HelpIntent: ${JSON.stringify({
      "speak": speechOutput,
      "listen": reprompt,
      "card" : {
        "title": cardTitle,
        "content": cardContent,
        "imageObj": imageObj
      }
    })}`);
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
    var speechOutput = 'Goodbye.';
    if (TableName) {
      speechOutput = `Your progress has been saved. ${speechOutput}`;
    }
    var cardTitle = 'Exit.';
    var cardContent = speechOutput;
    var imageObj = undefined;
    console.log(`CompletelyExit: ${JSON.stringify({
      "speak": speechOutput,
      "listen": null,
      "card" : {
        "title": cardTitle,
        "content": cardContent,
        "imageObj": imageObj
      }
    })}`);
    this.response.speak(speechOutput)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'Unhandled': function() {
    // handle any intent in interaction model with no handler code
    console.log(`Unhandled`);
    var speechOutput = 'This is the Ghost Story. ';
    var reprompt = 'I did not understand.';
    speechOutput = speechOutput + reprompt;
    var cardTitle = 'Help.';
    var cardContent = speechOutput;
    var imageObj = undefined;
    console.log(`HelpIntent: ${JSON.stringify({
      "speak": speechOutput,
      "listen": reprompt,
      "card" : {
        "title": cardTitle,
        "content": cardContent,
        "imageObj": imageObj
      }
    })}`);
    this.response.speak(speechOutput)
//      .listen(reprompt)
      .cardRenderer(cardTitle, cardContent, imageObj);
    this.emit(':responseReady');
  },
  'SessionEndedRequest': function() {
    // "exit", timeout or error. Cannot send back a response
    console.log(`Session ended: ${this.event.request.reason}`);
  },
}
