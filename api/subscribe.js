import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Message } from 'react-native-paho-mqtt';

const config = {
  mqtt: {
    url: 'wss://mqtt.swoh.dev:443/mqtt', // Ensure the URI is correctly formatted
    options: {
      username: 'user1',
      password: 'dU2QtgEror5hb'
    }
  }
};

let mqttClient = null;
let messagePromiseResolve = null;

export async function initializeMQTT() {
  try {
    // Create a client instance
    mqttClient = new Client({
      uri: config.mqtt.url,
      clientId: 'clientId',
      storage: AsyncStorage
    });

    // Set event handlers
    mqttClient.on('connectionLost', (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.error('MQTT connection lost:', responseObject.errorMessage);
      }
    });

    mqttClient.on('messageReceived', (message) => {
      const parsedMessage = handleMessage(message.destinationName, message.payloadString);
      if (messagePromiseResolve) {
        messagePromiseResolve(parsedMessage);
        messagePromiseResolve = null;
      }
    });

    // Connect the client
    await mqttClient.connect({
      userName: config.mqtt.options.username,
      password: config.mqtt.options.password,
      useSSL: true,
      onSuccess: () => {
        console.log('Connected to MQTT broker');
      },
      onFailure: (error) => {
        console.error('MQTT connection error:', error);
      }
    });

    console.log('MQTT Subscriber Service initialized');
  } catch (error) {
    console.error('Initialization error:', error);
    throw error;
  }
}

function handleMessage(topic, message) {
  console.log("Message Received:", message);
  const clientId = topic.split('/')[1];
  const parsedMessage = message.split(',');

  // Initialize itemsPresent array with default values
  const itemsPresent = [false, false, false];

  // Parse the message and update itemsPresent array
  parsedMessage.forEach((item) => {
    const [index, value] = item.split(':');
    itemsPresent[parseInt(index)] = value === '1';
  });

  console.log("Items Present:", itemsPresent);
  console.log(`Received message for client ${clientId}:`);
  console.log('Card:', itemsPresent[0]);
  console.log('Umbrella:', itemsPresent[1]);
  console.log('Water Bottle:', itemsPresent[2]);
  return itemsPresent;
}

export async function startMQTTSubscription(clientId) {
  try {
    // Subscribe to the last retained message for all clients
    await mqttClient.subscribe(`client/${clientId}`, { qos: 1 });
    console.log('Successfully subscribed to MQTT topic');
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
}

export async function findItemsForClient(clientId) {
  await initializeMQTT();
  await startMQTTSubscription(clientId);

  // Return a promise that resolves when a message is received
  return new Promise((resolve) => {
    messagePromiseResolve = resolve;
  });
}

// Example usage
// main("hello").catch(console.error);