const kafka = require("node-rdkafka");
const helper = require("./helper");

function kafkaCon ( kafkaConf ) {
  this.kafkaConf = kafkaConf;
  this.topic = "";
}

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

kafkaCon.prototype.produceMessages = function produceMessages( destTopic, messages ) {
  var kafkaConf = this.kafkaConf
  var conf = this.getConf( 'producer', destTopic );
  var topic = this.topic;
  // var selectedTopic = destTopic + '-topic';
  

  // Topic selection from config, terminate if not found
  // if( selectedTopic in kafkaConf.producer ) topic = kafkaConf.producer[selectedTopic];
  // else helper.printError( `There is no topic name for ${destTopic} in the config.` );

  const producer = new kafka.Producer( conf );

  // Write message to kafka
  producer.on( 'ready', (arg) => {

    helper.printLog( `Connected to Kafka host: ${ kafkaConf.brokers.join(",") }.` );
    helper.printLog( `Preparing to write messages to ${topic} topic.`);

    for( var i = 0; i < messages.length; i++ ) {
      producer.produce(topic, -1, Buffer.from( JSON.stringify( messages[i] ) ), i);
    }

    helper.printLog( `Written ${ messages.length } to kafka.`)
    setTimeout( () => producer.disconnect(), 0 );
  });

  // Other events driven behaviours
  producer.on( 'disconnected', (arg) => { helper.printLog( `Disconnecting from kafka queue.`); } );
  producer.on( 'event.error', (err) => { helper.printError( JSON.stringify(err) ); } );
  producer.on( 'event.log', (log) => { helper.printLog( log ); } );

  // Initiate conn and write messages
  producer.connect();
}

// Read messages from kafka
kafkaCon.prototype.consumeMessages = function consumeMessages( srcTopic ) {
  var kafkaConf = this.kafkaConf
  var conf = this.getConf( 'consumer', srcTopic );
  var topics = this.topic;

  // var selectedTopic = srcTopic + '-topics';
  const msgPerCommit = 5;
  let msgCounter = 0;

  console.log( "CONF:\n");
  console.log( conf );
  console.log( "topic: " + JSON.stringify(topics) );

  const consumer = new kafka.KafkaConsumer( conf, {
    "auto.offset.reset": "beginning"  // TODO: make it configurable
  });

  // Connected to kafka
  consumer.on( 'ready', function(arg) {

    helper.printLog( `Connected to Kafka host: ${ kafkaConf.brokers.join(",") }.` );
    helper.printLog( `Preparing to read messages from ${topics} topic with consumer name ${arg.name} and group of ${conf["group.id"]}`);
    consumer.subscribe( topics );
    consumer.consume();
  });

  // Reading data from kafka
  consumer.on( 'data', function(m) {
    msgCounter++;

    if (msgCounter % msgPerCommit === 0) consumer.commit(m);
    console.log(m.value.toString());
  });

  // Other events driven behaviours
  consumer.on('error', (err) => { helper.printError( JSON.stringify(err) ); } );
  consumer.on('event.error', (err) => { helper.printError( JSON.stringify(err) ); } );
  consumer.on('event.log', (log) => { console.log(log); } );
  consumer.on('disconnected', (arg) => { helper.printLog( `Disconnected from kafka.`); } );

  // Initiate conn and read messages
  consumer.connect();

  setTimeout(function() {
    consumer.disconnect();
  }, 15000);
}

module.exports = kafkaCon;