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
const uniqueUserId = 2;
const maxRecordsPerUser = 3;

// Check and set environment
if( process.argv[2] ) {
  env = process.argv[2];
  
  if( env in config ) helper.printLog( `${env.toUpperCase()} environment is selected.` );
  else helper.printError( `'${env}' environment is not available, try another environment.`, true );
}
else {
  helper.printError( `Specify environment for the app to start. E.g.: node app.js <environment>`, true );
}

// TODO:
// Read and summarise data set on the go
// Write generated data set to kafka-summary

// Main entry point
dataTool.generateDetailsDataSet( 2, 3 )   // Generate data set
.then( ds => { 
  helper.printLog( `Generating detail messages.` );
  // console.log( ds );

  const kafkaDetailProdCon = new kafkaCon( config.development.kafka );
  kafkaDetailProdCon.produceMessages( 'other' , ds );

  const kafkaDetailConsCon = new kafkaCon( config.development.kafka );
  kafkaDetailConsCon.consumeMessages( 'other' );
})
.catch( (error) => {
  console.log("THERE IS ERROR:\n" + JSON.stringify(error));
});