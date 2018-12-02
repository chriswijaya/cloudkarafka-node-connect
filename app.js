/*
  Author: Chris Wijaya
  Date: 2018/12/02
  Description: Main module for cloudkarafka connection
*/

// External mods
// var kafka = require("node-rdkafka");

// Internal mods
const dataTool = require('./dataTool');
const config = require("./config.json");
const helper = require("./helper");

// Globals
var env = "";
var dataSet;

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
// Generate data set
// Write generated data set to kafka-details
// Read and summarise data set on the go
// Write generated data set to kafka-summary

// Starts here ---------------
dataTool.generateDetailsDataSet( 2, 3 )
.then( ds => {
  helper.printLog( `Generating detail messages.` );
  //console.log( ds );
});