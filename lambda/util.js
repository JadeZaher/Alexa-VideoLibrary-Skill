const AWS = require('aws-sdk');
const bucketName = process.env.S3_PERSISTENCE_BUCKET;//Default Alexa Hosted Bucket';



module.exports = {

    
//Title case converter for converting slot to file name
    toTitleCase(str) {
          return str.replace(
            /\w\S*/g,
            function(txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
          );
        },
//adapter to get a signed temporary url to the video files and png files for the thumbnails 
getS3PreSignedUrl(s3ObjectKey) {
//connect to s3 bucket    
    const bucketName ='video-skill';
    
    AWS.config.update({
      region: 'no peaking', // Put your aws region here
      accessKeyId: "no peaking",
      secretAccessKey: "no peaking"
    })
    //Bucket Set Up
    const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4',
    accessKeyId: "no peaking",
    secretAccessKey: "no peaking"
    });
    //create the link
    try {
        const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
            Bucket: bucketName,
            Key: s3ObjectKey,
            Expires: 60*15
        });
        console.log(`util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
        return s3PreSignedUrl ? s3PreSignedUrl : 'none';
    } catch (err) {
        console.log(err);
        return 'none';
    }
        
            
},


    callDirectiveService(handlerInput, msg) {
        // Call Alexa Directive Service.
        const {requestEnvelope} = handlerInput;
        const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();
        const requestId = requestEnvelope.request.requestId;
        const {apiEndpoint, apiAccessToken} = requestEnvelope.context.System;
        // build the progressive response directive
        const directive = {
            header: {
                requestId
            },
            directive:{
                type: 'VoicePlayer.Speak',
                speech: msg
            }
        };
        // send directive
        return directiveServiceClient.enqueue(directive, apiEndpoint, apiAccessToken);
    },

//check for video interface support
    supportsAPL(handlerInput) {
        const {supportedInterfaces} = handlerInput.requestEnvelope.context.System.device;
        return !!supportedInterfaces['Alexa.Presentation.APL'];
    }
}