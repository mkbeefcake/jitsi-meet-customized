const mqtt = require('mqtt');
const host = 'broker.emqx.io';
const port = '1883';

const topicUserAdd = 'user_add';
const topicUserDel = 'user_del';

const MqttClient = () => {

  const connectToPublisher = (myTopic, callback) => {
    const connectUrl = `mqtt://${host}: ${port}`;
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
}

export default MqttClient;