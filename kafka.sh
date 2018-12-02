# This script is used to check result from summary queue
BROKERS=omnibus-01.srvs.cloudkafka.com:9094,omnibus-02.srvs.cloudkafka.com:9094,omnibus-03.srvs.cloudkafka.com:9094
USERNAME=pceiehl5
PASSWORD=kFVCcnzwrpb99hv2wnO5yR-hrccsS7R1
TOPIC=pceiehl5-summary

# Consumer
# kafkacat -b $BROKERS -C -X security.protocol=SASL_SSL -X sasl.mechanisms=SCRAM-SHA-256 -X sasl.username=$USERNAME -X sasl.password=$PASSWORD -p 1 -t $TOPIC

# Producer
# echo "Hello kafkacat!" | kafkacat -b $BROKERS -P -X security.protocol=SASL_SSL -X sasl.mechanisms=SCRAM-SHA-256 -X sasl.username=$USERNAME -X sasl.password=$PASSWORD -t $TOPIC


LIVEBROKERS=velomobile-01.srvs.cloudkafka.com:9094,velomobile-02.srvs.cloudkafka.com:9094,velomobile-03.srvs.cloudkafka.com:9094
LIVEUSERNAME=288jgwj2
LIVEPASSWORD=3-BW45B_GAqnPZEmfvsO3Lgj5UBBkcNg
LIVETOPIC=288jgwj2-christywijaya-summary

# Consumer from live 
kafkacat -b $LIVEBROKERS -C -X security.protocol=SASL_SSL -X sasl.mechanisms=SCRAM-SHA-256 -X sasl.username=$LIVEUSERNAME -X sasl.password=$LIVEPASSWORD -t $LIVETOPIC -v -X debug=generic,broker,security
