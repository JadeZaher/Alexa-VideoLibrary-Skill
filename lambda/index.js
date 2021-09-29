const AWS = require('aws-sdk');
const Alexa = require('ask-sdk-core');
const util = require('./util'); // utility function to get s3SignedURL


//////////////////////
//UI
//launch skill with vid nav screen
const LaunchRequestHandler = {
    
canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';

	},
async handle(handlerInput) {
    
    //s3 util
    
    //Handle Subscription event
	const locale = handlerInput.requestEnvelope.request.locale;
    let ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
    
    let speakOutput = 'Welcome to the Video Library. Which video would you like to watch?';
	let template = require('./templates/vidSelectScreenAPL.json');
    
    let products =  await ms.getInSkillProducts(locale);
    let availableProducts = products.inSkillProducts.filter(product => product.purchasable === 'PURCHASABLE');
    
    
   
    if(!util.supportsAPL(handlerInput)){
        speakOutput = "This device does not support this skill yet."
        
        return handlerInput.responseBuilder
        .speak(speakOutput)
		.getResponse();

    }else{
    return handlerInput.responseBuilder
        .speak(speakOutput)
        .addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				version: '1.7',
				document: template,
				token: "NavToken",
				datasources: {
				    "gridListData": {
                            type: "object",
                            objectId: "gridListSample",
                            backgroundImage: {
                              contentDescription: null,
                              smallSourceUrl: null,
                              largeSourceUrl: null,
                              sources: [
                                {
                                  url: "background.jpg",
                                  size: "small",
                                  widthPixels: 0,
                                  heightPixels: 0
                                },
                                {
                                  url: "background.jpg",
                                  size: "large",
                                  widthPixels: 0,
                                  heightPixels: 0
                                }
                              ]
                            },
                            title: "Video Library",
                            listItems: [
                              {
                                "primaryText": "Our Latest",
                                "imageSource": util.getS3PreSignedUrl("Media/Videos/Thumbnails/Our Latest.png")
                              },
                              {
                                "primaryText": "Video One",
                                "imageSource": util.getS3PreSignedUrl("Media/Videos/Thumbnails/Video One.png")
                              },
                              {
                                primaryText: "Video Two",
                                "imageSource": util.getS3PreSignedUrl("Media/Videos/Thumbnails/Video Two.png")
                              },
                              {
                                primaryText: "Video Three",
                                "imageSource": util.getS3PreSignedUrl("Media/Videos/Thumbnails/Video Thre.png")
                              },
                              {
                                "primaryText": "Video Four",
                                "imageSource": util.getS3PreSignedUrl("Media/Videos/Thumbnails/Video Four.png")
                              },
                              {
                                "primaryText": "Video Five",
                                "imageSource": util.getS3PreSignedUrl("Media/Videos/Thumbnails/Video Five.png")
                              },
                              {
                                "primaryText": "Video Six",
                                "imageSource": util.getS3PreSignedUrl("Media/Videos/Thumbnails/Video Six.png")
                              },
                              {
                                "primaryText": "Video Seven",
                                "imageSource": util.getS3PreSignedUrl("Media/Videos/Thumbnails/Video Seven.png")
                              }
                            ],
                            "logoUrl": util.getS3PreSignedUrl("Media/Logo.png")
                        	}}
			})
			.getResponse();
    }
       
       
    
    }
};


//////////////////////
//Play video by voice command
const PlayVideoIntent = {
	canHandle(handlerInput) {
	    
		return ((Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
				Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayVideoIntent'));
	},
    

	handle(handlerInput) {
	   let vidname;    
	   let vidnameSpeak;
	   let vidnameSlot = handlerInput.requestEnvelope.request.intent.slots.videoName.value;
	   const {requestEnvelope, responseBuilder} = handlerInput;
	   const {intent} = requestEnvelope.request;

	    
       vidname =  "Media/Videos/"+ vidnameSlot +".mp4";
       vidnameSpeak = "let's begin watching the "+vidnameSlot+" video";
	    

	    
    if(!util.supportsAPL(handlerInput)){
        var speakOutput = "This device does not support this skill yet."
        
        return handlerInput.responseBuilder
        .speak(speakOutput)
		.getResponse();
    }else{
		return handlerInput.responseBuilder
			.speak(speakOutput)
			.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				document: require('./templates/videoPlayer.json'),
				token: "NavToken",
				datasources: {
					launchData: {
						type: 'object',
						properties: {
							source: util.getS3PreSignedUrl(vidname)
						}
					}
				}
			})
			.addDirective({
				type: "Alexa.Presentation.APL.ExecuteCommands",
				token: "NavToken",
				commands: [{
					type: "ControlMedia",
					componentId: "videoPlayerId",
					command: "play"
				}]
			})
			.getResponse();
	}
	    
	}
}


//////////////////////
//Open Video with touch event
const TouchPlayVideoIntent = {
	canHandle(handlerInput) {
		return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent' &&
				handlerInput.requestEnvelope.request.arguments[0] === 'vidListItemSelected');
	},
    

handle(handlerInput) {
   let vidname;    
   let vidnameSpeak;
   let vidnameSlot = handlerInput.requestEnvelope.request.arguments[1];

   //get file and create voice response 
   vidname =  "Media/Videos/"+vidnameSlot+".mp4";
   vidnameSpeak = "let's begin watching the "+JSON.stringify(vidnameSlot)+" video";
	    
    if(!util.supportsAPL(handlerInput)){
        var speakOutput = "This device does not support this skill yet."
        
        return handlerInput.responseBuilder
        .speak(speakOutput)
		.getResponse();
    }else{
        //respond with the video player template and start the video
		return handlerInput.responseBuilder
			.addDirective({
				type: 'Alexa.Presentation.APL.RenderDocument',
				document: require('./templates/videoPlayer.json'),
				token: "NavToken",
				datasources: {
					launchData: {
						type: 'object',
						properties: {
							source: util.getS3PreSignedUrl(vidname)
						}
					}
				}
			})
			.addDirective({
				type: "Alexa.Presentation.APL.ExecuteCommands",
				token: "NavToken",
				commands: [{
					type: "ControlMedia",
					componentId: "videoPlayerId",
					command: "play"
				}]
			})
			.getResponse();
	    }
	    
	}
};

//////////////////////
//media controls

//send pause command to video player on trigger
const PauseIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent';
	},
	handle(handlerInput) {
		return handlerInput.responseBuilder
			.speak("Pausing ")
			.addDirective({
				type: "Alexa.Presentation.APL.ExecuteCommands",
				token: "NavToken",
				commands: [{
					type: "ControlMedia",
					componentId: "videoPlayerId",
					command: "pause"
				}]
			})
			.getResponse();
	}
};

//Send resume commmand to the video player on trigger
const ResumeIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent';
	},
	async handle(handlerInput) {
		return handlerInput.responseBuilder
			.speak("Resuming ")
			.addDirective({
				type: 'Alexa.Presentation.APL.ExecuteCommands',
				token: "NavToken",
				commands: [{
					type: "ControlMedia",
					componentId: "videoPlayerId",
					command: "play"
				}]
			})
			.getResponse();
	}
};

//Go back in the backstack and load the previous screen on trigger
const PreviousIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent';
	},
	async handle(handlerInput) {
		return handlerInput.responseBuilder
			.speak("Going back")
			.addDirective({
				type: "Alexa.Presentation.APL.ExecuteCommands",
				token: "NavToken",
				commands: [{
					type: "ControlMedia",
					componentId: "videoPlayerId",
					command: "pause"
				}]
			})
			.addDirective({
				type: 'Alexa.Presentation.APL.ExecuteCommands',
				token: "NavToken",
				commands: [{
					type: "Back:GoBack",
					componentId: "header"
				}]
			})
			.getResponse();
	}
};

//sub
const SubscribeIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'SubscribeIntent';
	},
async handle(handlerInput) {
	const locale = handlerInput.requestEnvelope.request.locale;
    let ms = handlerInput.serviceClientFactory.getMonetizationServiceClient()
    let products = await ms.getInSkillProducts(locale);
    let product = products.inSkillProducts.find(prod => prod.purchasable === 'PURCHASABLE');

if (product){
    return handlerInput.responseBuilder
        .addDirective({
            type: "Connections.SendRequest",
            name: "Subscribe",
            payload: {
                            InSkillProduct: {
                                productId: product.productId
                            }
                        },
                        version: product.version,
                        token: product.productId
            })
            .getResponse();
}else if (products.inSkillProducts.find(prod => prod.PurchasableState === 'PURCHASED')){
		return handlerInput.responseBuilder
        .speak('You are already subscribed to this service')
        .getResponse();
        }
    }
};

//unsub
const UnsubscribeIntent = {
	canHandle(handlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
			handlerInput.requestEnvelope.request.intent.name === 'UnsubscribeIntent';
	},
async handle(handlerInput) {
	const locale = handlerInput.requestEnvelope.request.locale;
    let ms = handlerInput.serviceClientFactory.getMonetizationServiceClient()
    let products = await ms.getInSkillProducts(locale);
    let product = products.inSkillProducts.find(prod => prod.purchasable === 'NOT_PURCHASABLE');

if (product){
    	return handlerInput.responseBuilder
        .addDirective({
            type: "Connections.SendRequest",
            name: "Cancel",
            payload: {
                            InSkillProduct: {
                                productId: product.productId
                            }
                        },
                        version: product.version,
                        token: product.productId
            })
            .getResponse();
}else{
		return handlerInput.responseBuilder
        .speak('Try again')
        .getResponse();
    }
}

};

//on getMonetizationServiceClient request buy
const UpsellOrBuyResponseHandler= {
        canHandle(handlerInput) {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response'
                && (handlerInput.requestEnvelope.request.name === 'Buy'
                    || handlerInput.requestEnvelope.request.name === 'Upsell');
        },
        async handle(handlerInput) {
            let {request} = handlerInput.requestEnvelope;
    
            if (request.status.code === '200' && request.payload.purchaseResult !== 'ERROR') {
                let speechOutput;
    
                switch (request.payload.purchaseResult) {
                    case 'ACCEPTED':
                        speechOutput = 'Thank You for begining your journey to Inhabit the change';
                        break;
                    case 'ALREADY_PURCHASED':
                        speechOutput = 'You have already purchased the library, please enjoy our content';
                        break;
                    case 'DECLINED':
                        speechOutput = 'We appreciate your consideration, and we hope that you will still inhabit change';
                        break;
                    default:
                        speechOutput = 'there seems to have been an issue';
                        break;
                }
    
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .getResponse();
            }
    
            return handlerInput.responseBuilder
                .speak('there seems to have been an issue')
                .getResponse();
        }
    }

//on getMonetizationServiceClient request cancel
const CancelProductResponseHandler = {
        canHandle(handlerInput) {
            return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Connections.Response'
                && handlerInput.requestEnvelope.request.name === 'Cancel';
        },
        async handle(handlerInput) {
            let {request} = handlerInput.requestEnvelope;
            let {payload} = request;
    
            if (request.status.code === '200') {
                let speechOutput;
                if (payload.purchaseResult === 'ACCEPTED') {
                    speechOutput = 'unsubscribed. We hope you continue to inhabit the change';
                } else if (payload.purchaseResult === 'DECLINED') {
    
                    speechOutput = 'No refund available. Not unsubscribed.'
                } else if (payload.purchaseResult === 'NOT_ENTITLED') {
    
                    speechOutput = 'You have not purchesed this product yet';
                }
    
                return handlerInput.responseBuilder
                    .speak(speechOutput)
                    .reprompt(speechOutput)
                    .getResponse();
            }
    
            return handlerInput.responseBuilder
                .speak('Something happened, try again ')
                .getResponse();
        }
}

//////////////////////
//Other Default intents and modified bioler plate
const HelpIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
			Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
	},
	handle(handlerInput) {
		const speakOutput = 'Welcome to the care from anywhere video library. Based on cutting edge science, made simple through the 7 elements. Please subscribe for access to our premium videos. If you are already subscribed and wish to unsubscribe, say Alexa unsubscribe from the care from anywhere video library.';

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(speakOutput)
			.getResponse();
	}
};

const CancelAndStopIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
			(Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent' ||
				Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
	},
	handle(handlerInput) {
		const speakOutput = 'Goodbye!';

		return handlerInput.responseBuilder
			.getResponse();
	}
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
			Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
	},
	handle(handlerInput) {
		const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(speakOutput)
			.getResponse();
	}
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
	},
	handle(handlerInput) {
		console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
		const speakOutput = 'Thank you for watching, remember to inhabit change!';

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.getResponse();
	}
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
	canHandle(handlerInput) {
		return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
	},
	handle(handlerInput) {
		const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
		const speakOutput = `You just triggered ${intentName}`;

		return handlerInput.responseBuilder
			.speak(speakOutput)
			//.reprompt('add a reprompt if you want to keep the session open for the user to respond')
			.getResponse();
	}
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
	canHandle() {
		return true;
	},
	handle(handlerInput, error) {
		const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
		console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

		return handlerInput.responseBuilder
			.speak(speakOutput)
			.reprompt(speakOutput)
			.getResponse();
	}
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .withApiClient(new Alexa.DefaultApiClient())
	.addRequestHandlers(
		LaunchRequestHandler,
		PlayVideoIntent,
		TouchPlayVideoIntent,
		ResumeIntent,
		PauseIntent,
		PreviousIntent,
		SubscribeIntent,
		UnsubscribeIntent,
		HelpIntentHandler,
		CancelAndStopIntentHandler,
		FallbackIntentHandler,
		SessionEndedRequestHandler,
		IntentReflectorHandler)
	.addErrorHandlers(
		ErrorHandler)
	.withCustomUserAgent('sample/hello-world/v1.2')
	.lambda();