import {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  PropsWithChildren,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import {
  PhoneCall,
  WebsocketClientConnectedPayload,
  WebsocketMessageType,
  WebsocketPhoneCallAcceptedPayload,
  WebsocketPhoneCallAssignedPayload,
  WebsocketPhoneCallEndedPayload,
  WebsocketPhoneCallStartedPayload,
  WebsocketPhoneCallInitiatedExternallyPayload,
  WebsocketPhoneCallTokenPayload,
  WebsocketPhoneCallTranscriptPayload,
} from '@unconventional-jackson/avoca-internal-api';
import { useInternalSdk } from '../api/sdk';

type WebsocketMessagePayload =
  | WebsocketPhoneCallAcceptedPayload
  | WebsocketPhoneCallAssignedPayload
  | WebsocketPhoneCallEndedPayload
  | WebsocketPhoneCallStartedPayload
  | WebsocketPhoneCallInitiatedExternallyPayload
  | WebsocketPhoneCallTokenPayload
  | WebsocketPhoneCallTranscriptPayload;

type AugmentedPhoneCall = PhoneCall & { elapsed?: number };
interface PhoneCallsContextProps {
  phoneCalls: AugmentedPhoneCall[];
  sendPhoneCallAccepted: (phoneCallId: string) => void;
  sendPhoneCallInitiatedExternally: () => void;
  connectionStatus: string;
}

// Create the AuthContext with initial values
export const PhoneCallsContext = createContext<PhoneCallsContextProps>({
  phoneCalls: [],
  sendPhoneCallAccepted: () => {},
  sendPhoneCallInitiatedExternally: () => {},
  connectionStatus: 'disconnected',
});

interface PhoneCallsProviderProps extends PropsWithChildren {
  url: string;
}

export const PhoneCallsProvider = ({ url, children }: PhoneCallsProviderProps) => {
  const { authUser } = useAuth();
  const internalSdk = useInternalSdk();
  const [phoneCalls, setPhoneCalls] = useState<AugmentedPhoneCall[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  // Fetch calls from API on a polling basis
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        if (!authUser?.employee_id) {
          return;
        }
        const response = await internalSdk.getPhoneCalls();
        const mostRecentCallTimestamp = Math.max(
          ...(response.data.phone_calls ?? [])
            ?.map((c) => [c.start_date_time, c.end_date_time])
            .flat()
            .filter((t): t is string => !!t)
            .map((t) => new Date(t).getTime())
        );

        setPhoneCalls((prevCalls) => {
          // merge prevCalls and response.data.phone_calls
          // If a call is in prevCalls but not response.data.phone_calls, we should only keep it if either it has not ended or if the end_date_time is greater than the mostRecentCallTimestamp
          return Object.values(
            [...prevCalls, ...(response.data.phone_calls ?? [])].reduce(
              (acc: Record<string, AugmentedPhoneCall>, call: AugmentedPhoneCall) => {
                if (!call.phone_call_id) {
                  return acc;
                }
                if (
                  (!response.data.phone_calls?.find(
                    (c) => c.phone_call_id === call.phone_call_id
                  ) &&
                    (!call.end_date_time ||
                      new Date(call.end_date_time).getTime() > mostRecentCallTimestamp)) ||
                  response.data.phone_calls?.find((c) => c.phone_call_id === call.phone_call_id)
                ) {
                  if (!acc[call.phone_call_id]) {
                    acc[call.phone_call_id] = call;
                  } else {
                    acc[call.phone_call_id] = {
                      ...acc[call.phone_call_id],
                      ...call,
                      start_date_time:
                        acc[call.phone_call_id].start_date_time ?? call.start_date_time,
                      end_date_time: acc[call.phone_call_id].end_date_time ?? call.end_date_time,
                      transcript: acc[call.phone_call_id].transcript ?? call.transcript,
                      elapsed: acc[call.phone_call_id].elapsed ?? call.elapsed,
                      customer_id: acc[call.phone_call_id].customer_id ?? call.customer_id,
                      job_id: acc[call.phone_call_id].job_id ?? call.job_id,
                      employee_id: acc[call.phone_call_id].employee_id ?? call.employee_id,
                      phone_call_id: acc[call.phone_call_id].phone_call_id,
                      phone_number: acc[call.phone_call_id].phone_number ?? call.phone_number,
                    };
                  }
                }
                return acc;
              },
              {}
            )
          ).sort((a, b) =>
            !!a.start_date_time && !!b.start_date_time
              ? new Date(b.start_date_time).getTime() - new Date(a.start_date_time).getTime()
              : 0
          );
        });
      } catch (error) {
        console.error('Error fetching calls:', error);
      }
    };

    const intervalId = setInterval(fetchCalls, 5000); // Poll every 5 seconds
    fetchCalls(); // Initial fetch
    return () => clearInterval(intervalId);
  }, [authUser?.employee_id]);

  const sendClientConnected = useCallback(() => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN &&
      authUser?.employee_id &&
      authUser?.access_token
    ) {
      const payload: WebsocketClientConnectedPayload = {
        event: WebsocketMessageType.ClientConnected,
        employee_id: authUser.employee_id,
        token: authUser.access_token,
      };

      wsRef.current?.send(JSON.stringify(payload));
    } else {
      console.error('PhoneCalls is not open. Unable to send message.');
    }
  }, [authUser?.employee_id, authUser?.access_token]);

  const sendPhoneCallAccepted = useCallback(
    (phoneCallId: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN && authUser?.employee_id) {
        const payload: WebsocketPhoneCallAcceptedPayload = {
          phone_call_id: phoneCallId,
          employee_id: authUser.employee_id,
          event: WebsocketMessageType.PhoneCallAccepted,
        };

        wsRef.current?.send(JSON.stringify(payload));
      } else {
        console.error('PhoneCalls is not open. Unable to send message.');
      }
    },
    [authUser?.employee_id]
  );

  const sendPhoneCallInitiatedExternally = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && authUser?.employee_id) {
      const payload: WebsocketPhoneCallInitiatedExternallyPayload = {
        event: WebsocketMessageType.PhoneCallInitiatedExternally,
      };

      wsRef.current?.send(JSON.stringify(payload));
    } else {
      console.error('PhoneCalls is not open. Unable to send message.');
    }
  }, [authUser?.employee_id]);

  const onPhoneCallStarted = useCallback((payload: WebsocketPhoneCallStartedPayload) => {
    setPhoneCalls((prevCalls) => {
      if (!prevCalls.find((call) => call.phone_call_id === payload.phone_call_id)) {
        return [...prevCalls, payload];
      }
      return prevCalls.map((call) =>
        call.phone_call_id === payload.phone_call_id
          ? { ...call, start_date_time: payload.start_date_time }
          : call
      );
    });
  }, []);

  const onPhoneCallAssigned = useCallback((payload: WebsocketPhoneCallAssignedPayload) => {
    setPhoneCalls((prevCalls) => {
      if (!prevCalls.find((call) => call.phone_call_id === payload.phone_call_id)) {
        return [...prevCalls, payload];
      }
      return prevCalls.map((call) =>
        call.phone_call_id === payload.phone_call_id
          ? { ...call, employee_id: payload.employee_id }
          : call
      );
    });
  }, []);

  const onPhoneCallToken = useCallback((payload: WebsocketPhoneCallTokenPayload) => {
    setPhoneCalls((prevCalls) => {
      if (!prevCalls.find((call) => call.phone_call_id === payload.phone_call_id)) {
        return [
          ...prevCalls,
          {
            ...payload,
            transcript: payload.token,
          },
        ];
      }
      return prevCalls.map((call) =>
        call.phone_call_id === payload.phone_call_id
          ? {
              ...call,
              transcript: call.transcript ? `${call.transcript} ${payload.token}` : payload.token,
            }
          : call
      );
    });
  }, []);

  const onPhoneCallTranscript = useCallback((payload: WebsocketPhoneCallTranscriptPayload) => {
    setPhoneCalls((prevCalls) => {
      if (!prevCalls.find((call) => call.phone_call_id === payload.phone_call_id)) {
        return [...prevCalls, payload];
      }
      return prevCalls.map((call) =>
        call.phone_call_id === payload.phone_call_id
          ? { ...call, transcript: payload.transcript }
          : call
      );
    });
  }, []);

  const onPhoneCallEnded = useCallback((payload: WebsocketPhoneCallEndedPayload) => {
    setPhoneCalls((prevCalls) => {
      if (!prevCalls.find((call) => call.phone_call_id === payload.phone_call_id)) {
        return [...prevCalls, payload];
      }
      return prevCalls.map((call) =>
        call.phone_call_id === payload.phone_call_id
          ? { ...call, end_date_time: payload.end_date_time }
          : call
      );
    });
  }, []);

  const handleIncomingMessage = (_message: WebsocketMessagePayload) => {
    if (_message.event === WebsocketMessageType.PhoneCallStarted) {
      onPhoneCallStarted(_message as WebsocketPhoneCallStartedPayload);
    } else if (_message.event === WebsocketMessageType.PhoneCallAssigned) {
      onPhoneCallAssigned(_message as WebsocketPhoneCallAssignedPayload);
    } else if (_message.event === WebsocketMessageType.PhoneCallToken) {
      onPhoneCallToken(_message as WebsocketPhoneCallTokenPayload);
    } else if (_message.event === WebsocketMessageType.PhoneCallTranscript) {
      onPhoneCallTranscript(_message as WebsocketPhoneCallTranscriptPayload);
    } else if (_message.event === WebsocketMessageType.PhoneCallEnded) {
      onPhoneCallEnded(_message as WebsocketPhoneCallEndedPayload);
    } else if (_message.event === WebsocketMessageType.ClientConnected) {
      // Do nothing
    } else if (_message.event === WebsocketMessageType.PhoneCallAccepted) {
      // Do nothing
    }
    return;
  };

  useEffect(() => {
    if (!authUser?.employee_id) {
      return;
    }

    // Open PhoneCalls connection
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus('connected');
      sendClientConnected();
    };
    ws.onclose = () => setConnectionStatus('disconnected');
    ws.onerror = (error) => {
      console.log({ error });
      setConnectionStatus('error');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleIncomingMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    return () => {
      // Clean up PhoneCalls on unmount
      ws.close();
    };
  }, [url, authUser?.employee_id]);

  // Update elapsed time for active calls
  useEffect(() => {
    const intervalId = setInterval(() => {
      setPhoneCalls((prevCalls) =>
        prevCalls.map((call) =>
          !call.end_date_time && call.start_date_time
            ? {
                ...call,
                elapsed: Math.floor((Date.now() - new Date(call.start_date_time).getTime()) / 1000),
              }
            : call
        )
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <PhoneCallsContext.Provider
      value={{
        phoneCalls,
        sendPhoneCallAccepted,
        sendPhoneCallInitiatedExternally,
        connectionStatus,
      }}
    >
      {children}
    </PhoneCallsContext.Provider>
  );
};

export const usePhoneCalls = () => {
  const context = useContext(PhoneCallsContext);
  if (!context) {
    throw new Error('usePhoneCalls must be used within a PhoneCallsProvider');
  }
  return context;
};
