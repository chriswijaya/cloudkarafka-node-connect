/*
  Author: Chris Wijaya
  Date: 2018/12/02
  Description: Main module for cloudkarafka connection
*/

const dataTool = require('./dataTool');
const config = require("./config.json");
const helper = require("./helper");
const kafkaCon = require("./kafkaCon");

// Globals
var env = "";
const uniqueUsers = 2;
const maxRecordsPerUser = 3;
var kafkaDetailProdCon;
var kafkaDetailConsCon;

// Check and set environment
if( process.argv[2] ) {
  env = process.argv[2];
  
  if( env in config ) helper.printLog( `${env.toUpperCase()} environment is selected.` );
  else helper.printError( `'${env}' environment is not available, try another environment.`, true );
}
else {
  helper.printError( `Specify environment for the app to start. E.g.: node app.js <environment>`, true );
}

// Main entry point
dataTool.generateDetailsDataSet( uniqueUsers, maxRecordsPerUser )   // Generate data set
.then( ds => { 
  helper.printLog( `Generating detail messages.` );

  // Produce generated messages to kafka detail topic
  kafkaDetailProdCon = new kafkaCon( config[ env ].kafka );
  kafkaDetailProdCon.produceMessages( 'detail' , ds );

  // Produce statistics to kafka summary topic from consumed messages in kafka detail topic
  kafkaDetailConsCon = new kafkaCon( config[ env ].kafka );
  kafkaDetailConsCon.consumeMessagesAndProduceStats( 'detail', 'summary' );
})
.catch( (error) => {
  console.log("THERE IS ERROR:\n" + JSON.stringify(error));
});

// Trigger disconnect event on kafkaCon.consumeMessagesAndProduceStats
// This will produce statistical messages to Kafka
function exitHandler() {
  if( kafkaDetailConsCon && kafkaDetailConsCon.consumer) kafkaDetailConsCon.consumer.disconnect();
}

process.on( 'exit', exitHandler );
process.on( 'SIGINT', exitHandler );