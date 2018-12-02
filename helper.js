/*
  Author: Chris Wijaya
  Date: 2018/12/02
  Description: Module for helper functions
*/

// Log message string builder
function buildLogMessage( type, message ) {

  const now = new Date();

  const dateShortFormat = [
    now.getFullYear(),
    (now.getMonth() + 1),
    now.getDate()
  ]

  const timeShortFormat = [
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  ]

  const timeStamp = dateShortFormat.join("-") + " " + timeShortFormat.join(":");

  return `[${timeStamp}] ${type} | ${message}`;
}

// Print error message
var printError = function( message = "", exitApp = false, statusCode = -1 ) {
  console.error( buildLogMessage('ERROR', message) );
  if( exitApp ) process.exit( statusCode );
}

// Print log message
var printLog = function( message = "" ) {
  console.error( buildLogMessage('LOG', message) );
}

module.exports = {
  printError: printError,
  printLog: printLog
}