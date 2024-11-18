import { faker } from '@faker-js/faker';
import { WebSocket } from 'ws';

// Configuration
const PORT = 8080;
const MAX_CALL_DURATION = 20000; // Max duration for a call in ms
const MIN_CALL_DURATION = 5000; // Min duration for a call in ms
const MIN_INTERVAL = 500; // Min interval between token emissions in ms
const MAX_INTERVAL = 2000; // Max interval between token emissions in ms

// Create a WebSocket Server
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

// Function to generate random lorem ipsum tokens
const generateTokens = () => faker.lorem.words(Math.floor(Math.random() * 10) + 5).split(' ');

// Function to create and emit a call
const createCall = (client: WebSocket) => {
  const callId = faker.string.uuid();
  const tokens = generateTokens();
  const callDuration = Math.random() * (MAX_CALL_DURATION - MIN_CALL_DURATION) + MIN_CALL_DURATION;

  // Add required name and address fields at random positions
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const address = {
    line1: faker.location.streetAddress(),
    line2: faker.location.secondaryAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zip: faker.location.zipCode(),
  };

  const nameToken = `$${firstName} $${lastName}`;
  const addressToken = `$${address.line1}, $${address.line2}, $${address.city}, $${address.state}, $${address.zip}`;

  tokens.splice(Math.floor(Math.random() * tokens.length), 0, nameToken);
  tokens.splice(Math.floor(Math.random() * tokens.length), 0, addressToken);

  console.log(`Starting call: ${callId} with ${tokens.length} tokens`);

  let index = 0;
  const interval = setInterval(
    () => {
      if (index >= tokens.length) {
        clearInterval(interval);
        client.send(JSON.stringify({ callId, event: 'call_end' }));
        console.log(`Call ended: ${callId}`);
      } else {
        client.send(JSON.stringify({ callId, token: tokens[index++] }));
      }
    },
    Math.random() * (MAX_INTERVAL - MIN_INTERVAL) + MIN_INTERVAL
  );
};

// Handle client connections
wss.on('connection', (ws) => {
  console.log('New client connected.');

  const callLoop = setInterval(() => {
    if (Math.random() < 0.5) {
      createCall(ws);
    }
  }, 3000); // Random interval between calls

  ws.on('close', () => {
    clearInterval(callLoop);
    console.log('Client disconnected.');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});
