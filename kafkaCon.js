const kafka = require("node-rdkafka");
const helper = require("./helper");
const dataTool = require('./dataTool');

// Object def
function kafkaCon ( kafkaConf ) {
  this.kafkaConf = kafkaConf;
  this.topic = "";
  this.summary = null;
}

// Filter and set configurattions
kafkaCon.prototype.getConf = function( type, selectedTopic ) {
  kafkaConf = this.kafkaConf;

  var conf = {
    "metadata.broker.list": kafkaConf.brokers,
    "socket.keepalive.enable": true,
    "security.protocol": kafkaConf['security-protocol'],
    "sasl.mechanisms": kafkaConf['sasl-mechanisms'],
    "sasl.username": kafkaConf['sasl-username'],
    "sasl.password": kafkaConf['sasl-password'],
  }

  if( type === 'producer' ) {
    var topicName = selectedTopic + '-topic';
    if( topicName in kafkaConf.producer ) this.topic = kafkaConf.producer[topicName];
    else helper.printError( `There is no topic name for ${selectedTopic} in the config.` );

    conf["group.id"] = this.kafkaConf.producer['group-id'];
  }
  else if( type === 'consumer' ) {
    var topicName = selectedTopic + '-topics';
    if( topicName in kafkaConf.consumer ) this.topic = kafkaConf.consumer[topicName];
    else helper.printError( `There is no topic name for ${destTopic} in the config.` );    

    conf["group.id"] = this.kafkaConf.consumer['group-id'];
  }
  else helper.printError( `Unknown kafka config type.` );

  return conf;
}

// Produce messages to kafka
kafkaCon.prototype.produceMessages = function produceMessages( destTopic, messages ) {
  const kafkaConf = this.kafkaConf
  const conf = this.getConf( 'producer', destTopic );
  const topic = this.topic;

  const producer = new kafka.Producer( conf );

  // Write message to kafka
  producer.on( 'ready', (arg) => {

    helper.printLog( `Producer connected to Kafka @ host: ${ kafkaConf.brokers.join(",") }.` );
    helper.printLog( `Preparing to write messages to ${topic} topic.`);

    for( var i = 0; i < messages.length; i++ ) {
      producer.produce(topic, -1, Buffer.from( JSON.stringify( messages[i] ) ), i);
    }

    helper.printLog( `Written ${ messages.length } messages to kafka.`)
    setTimeout( () => producer.disconnect(), 0 );
  });

  // Other events driven behaviours
  producer.on( 'disconnected', (arg) => { helper.printLog( `Producer disconnecting from kafka queue.`); } );
  producer.on( 'event.error', (err) => { helper.printError( JSON.stringify(err) ); } );
  producer.on( 'event.log', (log) => { helper.printLog( log ); } );

  // Initiate conn and write messages
  producer.connect();
}

// Read messages from kafka, and assign kafkaCon.consumer
kafkaCon.prototype.consumeMessagesAndProduceStats = function consumeMessagesAndProduceStats( srcTopic, dstTopic ) {
  const kafkaConf = this.kafkaConf
  const conf = this.getConf( 'consumer', srcTopic );
  const topics = this.topic;
  var summary = {};

  const msgPerCommit = 5;
  let msgCounter = 0;

  const consumer = new kafka.KafkaConsumer( conf, {
    "auto.offset.reset": "beginning"  // TODO: make it configurable
  });
  this.consumer = consumer;

  // Connected to kafka
  consumer.on( 'ready', function(arg) {

    helper.printLog( `Consumer to Kafka @ host: ${ kafkaConf.brokers.join(",") }.` );
    helper.printLog( `Preparing to read messages from ${topics} topic with consumer name ${arg.name} and group of ${conf["group.id"]}` );
    consumer.subscribe( topics );
    consumer.consume();
    setTimeout( () => { helper.printLog( `Consuming messages... [Press Ctrl + C after 'added to the summary message appear' to produce summary messages to Kafka]` ) }, 2000 );
  });

  // Reading data from kafka
  consumer.on( 'data', function(msg) {
    msgCounter++;

    if (msgCounter % msgPerCommit === 0) consumer.commit(msg);  // Commit per x message read

    summary = dataTool.sumMessage( summary, JSON.parse( msg.value.toString() ) );  
    helper.printLog( `Message #${msgCounter} added to the summary.`);
  });

  // Other events driven behaviours
  consumer.on('error', (err) => { helper.printError( JSON.stringify(err) ); } );
  consumer.on('event.error', (err) => { helper.printError( JSON.stringify(err) ); } );
  consumer.on('event.log', (log) => { console.log(log); } );

  consumer.on('disconnected', (arg) => { 
    // Transform summary object into array to feed into produceMessage as param
    var summaryMessages = new Array();
    for( let key in summary ) summaryMessages.push( summary[ key ] );

    // Some status updates
    helper.printLog( `Consummer disconnecting from kafka.`); 
    helper.printLog( `Data aggregation stats: `);
    console.log( summaryMessages );

    const kafkaSummaryProdCon = new kafkaCon( kafkaConf );
    kafkaSummaryProdCon.produceMessages( dstTopic, summaryMessages );
  } );

  // Initiate conn and read messages
  consumer.connect();
}

module.exports = kafkaCon;