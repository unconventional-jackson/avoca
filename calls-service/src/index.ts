/* eslint-disable @typescript-eslint/naming-convention */
import { faker } from '@faker-js/faker';
import { NodeLogger } from '@unconventional-code/observability-sdk';
import {
  WebsocketClientConnectedPayload,
  WebsocketMessageType,
  WebsocketPhoneCallAcceptedPayload,
  WebsocketPhoneCallAssignedPayload,
  WebsocketPhoneCallEndedPayload,
  WebsocketPhoneCallStartedPayload,
  WebsocketPhoneCallTokenPayload,
  WebsocketPhoneCallTranscriptPayload,
} from '@unconventional-jackson/avoca-internal-api';
import { WebSocket } from 'ws';

import { getCallsSdk } from './utils/api';
import { ensureToken } from './utils/auth';
import { getConfig } from './utils/secrets';

const log = new NodeLogger({
  name: 'calls-service',
});

// Configuration
const MIN_INTERVAL = 250; // Min interval between token emissions in ms
const MAX_INTERVAL = 1000; // Max interval between token emissions in ms

// Data store for ongoing calls
const activeCalls: Record<
  string,
  {
    tokens: string[];
    transcript?: string;
    phone_call_id?: string;
    phone_number?: string;
    client?: WebSocket;
    employee_id?: string;
    start_date_time?: string;
    end_date_time?: string;
  }
> = {};

// Data store for ongoing connections
const activeConnections = new Map<string, WebSocket>();

// Helper function to generate random delay
const getRandomDelay = () => Math.random() * (MAX_INTERVAL - MIN_INTERVAL) + MIN_INTERVAL;

// Function to generate random lorem ipsum tokens
const generateTokens = () => {
  // Generate random number of tokens
  const tokens = faker.lorem.words(Math.floor(Math.random() * 100) + 25).split(' ');

  // Generate name and address tokens
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

  // Add required name and address fields at random positions
  tokens.splice(Math.floor(Math.random() * tokens.length), 0, nameToken);
  tokens.splice(Math.floor(Math.random() * tokens.length), 0, addressToken);

  return tokens;
};

export async function sendPhoneCallToken(phoneCallId: string, token: string, client?: WebSocket) {
  try {
    await new Promise<void>((resolve) => {
      const phoneCall = activeCalls[phoneCallId];
      const websocketClient = client ?? phoneCall?.client;
      if (websocketClient) {
        const payload: WebsocketPhoneCallTokenPayload = {
          phone_call_id: phoneCallId,
          token,
          event: WebsocketMessageType.PhoneCallToken,
        };
        websocketClient.send(JSON.stringify(payload));
      }
      resolve();
    });
  } catch (error) {
    log.error(error, {
      phoneCallId,
    });
  }
}

export async function sendPhoneCallTranscript(phoneCallId: string, client?: WebSocket) {
  try {
    await new Promise<void>((resolve) => {
      const phoneCall = activeCalls[phoneCallId];
      const websocketClient = client ?? phoneCall?.client;
      if (websocketClient && phoneCall.transcript) {
        const payload: WebsocketPhoneCallTranscriptPayload = {
          phone_call_id: phoneCallId,
          transcript: phoneCall.transcript,
          event: WebsocketMessageType.PhoneCallEnded,
        };
        websocketClient.send(JSON.stringify(payload));
      }
      resolve();
    });
  } catch (error) {
    log.error(error, {
      phoneCallId,
    });
  }
}

export async function sendPhoneCallStarted(phoneCallId: string, client?: WebSocket) {
  try {
    await new Promise<void>((resolve) => {
      const phoneCall = activeCalls[phoneCallId];
      const websocketClient = client ?? phoneCall?.client;
      if (websocketClient && phoneCall.phone_number && phoneCall.start_date_time) {
        const payload: WebsocketPhoneCallStartedPayload = {
          phone_call_id: phoneCallId,
          phone_number: phoneCall.phone_number,
          start_date_time: phoneCall.start_date_time,
          event: WebsocketMessageType.PhoneCallStarted,
        };
        websocketClient.send(JSON.stringify(payload));
      }
      resolve();
    });
  } catch (error) {
    log.error(error, {
      phoneCallId,
    });
  }
}

export async function sendPhoneCallEnded(phoneCallId: string, client?: WebSocket) {
  try {
    await new Promise<void>((resolve) => {
      const phoneCall = activeCalls[phoneCallId];
      const websocketClient = client ?? phoneCall?.client;
      if (websocketClient && phoneCall.end_date_time) {
        const payload: WebsocketPhoneCallEndedPayload = {
          phone_call_id: phoneCallId,
          end_date_time: phoneCall.end_date_time,
          event: WebsocketMessageType.PhoneCallEnded,
        };
        websocketClient.send(JSON.stringify(payload));
      }
      resolve();
    });
  } catch (error) {
    log.error(error, {
      phoneCallId,
    });
  }
}

export async function sendPhoneCallAssigned(phoneCallId: string, client?: WebSocket) {
  try {
    await new Promise<void>((resolve) => {
      const phoneCall = activeCalls[phoneCallId];
      const websocketClient = client ?? phoneCall?.client;
      if (websocketClient && phoneCall.employee_id) {
        const payload: WebsocketPhoneCallAssignedPayload = {
          phone_call_id: phoneCallId,
          employee_id: phoneCall.employee_id,
          event: WebsocketMessageType.PhoneCallAssigned,
        };
        websocketClient.send(JSON.stringify(payload));
      }
      resolve();
    });
  } catch (error) {
    log.error(error, {
      phoneCallId,
    });
  }
}

export async function onClientConnected(employeeId: string, token: string, client?: WebSocket) {
  try {
    await ensureToken(token);
    if (client) {
      activeConnections.set(employeeId, client);
    }
  } catch (error) {
    log.error(error, {
      employeeId,
    });
  }
}
export async function onPhoneCallAccepted(
  phoneCallId: string,
  employeeId: string,
  client?: WebSocket
) {
  try {
    log.info('Employee is accepting phone call', {
      phoneCallId,
      employeeId,
    });
    const callsSdk = await getCallsSdk();
    await callsSdk.updatePhoneCall(phoneCallId, {
      employee_id: employeeId,
    });

    activeCalls[phoneCallId].employee_id = employeeId;
    activeCalls[phoneCallId].client = client;

    for (const [, connection] of activeConnections) {
      await sendPhoneCallAssigned(phoneCallId, connection);
    }
    log.info('Sending employee transcript', {
      phoneCallId,
      employeeId,
    });
    await sendPhoneCallTranscript(phoneCallId, client);
  } catch (error) {
    log.error(error, {
      phoneCallId,
      employeeId,
    });
  }
}

// Function to handle a call's lifecycle
const handleCall = async () => {
  try {
    const phoneNumber = faker.phone.number();
    const tokens = generateTokens();
    log.info('Prepared call', {
      phoneNumber,
      tokens,
    });

    // Notify external API of the call start
    const callsSdk = await getCallsSdk();
    const startDateTime = new Date().toISOString();
    const apiResponse = await callsSdk.createPhoneCall({
      start_date_time: startDateTime,
      phone_number: phoneNumber,
    });

    log.info('Call created', {
      ...apiResponse.data,
    });

    const phoneCallId = apiResponse.data.phone_call_id; // Assume API returns call_id
    if (!phoneCallId) {
      throw new Error('Failed to create phone call.');
    }

    log.info(`Starting call: ${phoneCallId} with ${tokens.length} tokens`);
    activeCalls[phoneCallId] = {
      phone_number: phoneNumber,
      tokens,
      start_date_time: startDateTime,
    };

    log.info(`New call started: ${phoneCallId}`);

    // Notify ALL clients, round-robin, of the new call
    for (const [, client] of activeConnections) {
      await sendPhoneCallStarted(phoneCallId, client);
    }

    // Simulate call duration, emitting tokens at random intervals and notifying the one client that is connected
    const transcript = [];
    while (tokens.length > 0) {
      const token = tokens.shift();
      if (!token) {
        break;
      }
      transcript.push(token);
      activeCalls[phoneCallId].transcript = transcript.join(' ');
      const client = activeCalls[phoneCallId].client;
      if (client) {
        await sendPhoneCallToken(phoneCallId, token, client);
      }
      await new Promise((r) => setTimeout(r, getRandomDelay()));
    }

    // Notify external API of call end
    const endDateTime = new Date().toISOString();
    await callsSdk.updatePhoneCall(phoneCallId, {
      transcript: transcript.join(' '),
      end_date_time: endDateTime,
    });
    activeCalls[phoneCallId].transcript = transcript.join(' ');
    activeCalls[phoneCallId].end_date_time = endDateTime;

    // Notify ALL clients, round-robin, of the call end
    for (const [, client] of activeConnections) {
      await sendPhoneCallEnded(phoneCallId, client);
    }

    log.info(`Call ended: ${phoneCallId}`);
    delete activeCalls[phoneCallId];
  } catch (error) {
    log.error(error);
    log.info(`Failed to create phone call: ${String(error)}`);
  }
};

async function main() {
  const config = await getConfig();
  // Create a WebSocket Server
  const wss = new WebSocket.Server({ port: config.WEBSOCKET_PORT });
  log.info(`WebSocket server is running on ws://localhost:${config.WEBSOCKET_PORT}`);

  // Handle client connections
  wss.on('connection', (ws) => {
    log.info('New client connected.');

    // Keep track of the employee_id for the connection
    let employee_id: string | null = null;

    // Handle incoming messages - we only expect one incoming message type
    ws.on('message', (data) => {
      const _message = JSON.parse(data.toLocaleString()) as
        | WebsocketClientConnectedPayload
        | WebsocketPhoneCallAcceptedPayload;

      if (_message.event === WebsocketMessageType.ClientConnected) {
        const message = _message as WebsocketClientConnectedPayload;
        void onClientConnected(message.employee_id, message.token, ws);
        employee_id = message.employee_id;
        return;
      }

      if (_message.event === WebsocketMessageType.PhoneCallAccepted) {
        const message = _message as WebsocketPhoneCallAcceptedPayload;
        void onPhoneCallAccepted(message.phone_call_id, message.employee_id, ws);
        return;
      }

      log.info('Invalid message type');
    });

    // Handle client disconnections
    ws.on('close', () => {
      if (employee_id) {
        activeConnections.delete(employee_id);
      }
      log.info('Client disconnected.', {
        employee_id,
      });
    });

    ws.on('error', (error) => {
      log.error(error);
    });
  });

  setInterval(() => {
    log.info('Preparing to emit new call');
    setTimeout(() => {
      log.info('Emitting new call');
      handleCall().catch((error) => log.error(error));
    }, getRandomDelay());
  }, 5000); // Random interval between calls
}
main().catch((error) => log.error(error));
