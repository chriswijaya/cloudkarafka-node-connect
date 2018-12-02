/*
  Author: Chris Wijaya
  Date: 2018/12/02
  Description: Tools for data module
*/

// Template for log data
// NOTE: DO NOT modify the structure
const logDataTemplate = {  
  "userId": "",
  "visitorId": "",
  "type": "",
  "Metadata": {  
    "messageId": "",
    "sentAt": 0,
    "timestamp": 0,
    "receivedAt": 0,
    "apiKey": "",
    "spaceId": "",
    "version": ""
  },
  "event": "Played Movie",
  "eventData": {  
    "MovieID": ""
   }
}

// Template for summary data
// NOTE: DO NOT modify the structure
const summaryDataTemplate = {  
   "userId": "",
   "firstSeen": 0,
   "lastSeen": 0
}

// Randomer functions
function generateRandomNumber( length = 8, padLeadingZeros = true ) {
  const randomerLength = Math.pow(10, length) - 1;
  const numericId = ( Math.floor( (Math.random() * randomerLength) + 1 ) + "" ).padStart( length, '0' );

  return numericId;
}

function generateRandomString( length = 1) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  var randomStr = "";

  for( let i = 0; i < length; i++)
    randomStr += alphabet[Math.floor(Math.random() * alphabet.length)];
  
  return randomStr;
}

// Details data generator -------------------------
// Generate random id
function generateRandomId() {
  
  const numericId = generateRandomNumber( 8 );
  const charId = generateRandomString( 1 );

  return charId + numericId;
}

// Generate details data
var generateDetailsData = ( userId ) => {
  return {
    "userId": userId,
    "visitorId": generateRandomId(),
    "type": "Event",
    "Metadata": {
      "messageId": generateRandomId(),
      "sentAt": new Date().getTime(),
      "timestamp": new Date().getTime(),
      "receivedAt": 0,
      "apiKey": "",
      "spaceId": "",
      "version": "v1"
    },
    "event": "Played Movie",
    "eventData": {  
      "MovieID": generateRandomId()
    }
  }
}

// Delayer function
const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Generate summary data sets
var generateDetailsDataSet = async ( uniqueUsers = 5, maxRecordsPerUser = 8 ) => {
  var dataSet = [];

  // Start generating user details data
  for( let i = 0; i < uniqueUsers; i++ )  {

    const user = generateRandomId();
    let userRecordsCount = Math.floor(Math.random() * maxRecordsPerUser) + 1;

    for( let j = 0; j < userRecordsCount; j++ ) {
      await sleep(3);
      dataSet.push( generateDetailsData( user ) );
    }
  }

  return dataSet;
}

// Summary data aggregator -------------------------
// TODO


module.exports = {
  generateRandomId: generateRandomId,
  generateDetailsDataSet: generateDetailsDataSet
}
