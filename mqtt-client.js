const mqtt = require('mqtt');
const host = 'broker.emqx.io';
const port = '8883';

const topicUserAdd = 'user_add';
const topicUserDel = 'user_del';

export default function connectToPublisher(myTopic, callback) {
  console.log(`MqttClient::connectToPublisher() is called`);

  const connectUrl = `mqtts://${host}:${port}`;
  const client = mqtt.connect(connectUrl);


  client.on('connect', function() {
    console.log('MQTT client is connected : ' + client.connected);

    client.publish(topicUserAdd, myTopic);
    client.subscribe(myTopic);
  });

  client.on('message', function(myTopic, message, packet) {
    console.log(`message: ${myTopic}, ${message}`);
  });
}
