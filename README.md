# cloudkarafka-node-connect
Demonstration of Node JS connection to cloudkarafka with data aggregator.

# Overview
The app produces data sets of user event details into a kafka topic based on following parameters on 'app.js'

* uniqueUsers
* maxRecordsPerUser

Then consume the topic and aggregate the result upon incoming message based on user event's timestamp to determine a user's first seen and last seen timestamp.

# Running The App
First, install the dependencies of the app by running

```bash
npm install
```

Then running the app by following command

```bash
npm start
```

or select a different environment specified in `config.js` by using following command:

```bash
node app.js <environment>

e.g. (See environment preset in 'config.js'):
node app.js live
```

# Environment
The app is tested in following environment:
* Node.js v10.14.1
* NPM 6.4.1
* node-rdkafka ^2.4.2

Optional:
* kafkacat

# References

* [node-rdkafka](https://github.com/Blizzard/node-rdkafka)
* [Kafkacat](https://www.cloudkarafka.com/docs-kafkacat.html) 

# License
MIT