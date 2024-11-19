import { createContext, useState, useEffect, useContext, useRef, PropsWithChildren } from 'react';
import { useAuth } from './AuthContext';
import { PhoneCall } from '@unconventional-jackson/avoca-internal-api';
import { useInternalSdk } from '../api/sdk';

type AugmentedPhoneCall = PhoneCall & { elapsed?: number };
interface PhoneCallsContextProps {
  phoneCalls: AugmentedPhoneCall[];
  sendMessage: (data: any) => void;
  connectionStatus: string;
}

// Create the AuthContext with initial values
export const PhoneCallsContext = createContext<PhoneCallsContextProps>({
  phoneCalls: [],
  sendMessage: () => {},
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

  const reconcileCalls = (newCall: PhoneCall) => {
    setPhoneCalls((prevCalls) => {
      const existingCallIndex = prevCalls.findIndex(
        (call) => call.phone_call_id === newCall.phone_call_id
      );
      if (existingCallIndex !== -1) {
        // Update the existing call
        const updatedCalls = [...prevCalls];
        updatedCalls[existingCallIndex] = { ...updatedCalls[existingCallIndex], ...newCall };
        return updatedCalls;
      } else {
        // Add the new call
        return [...prevCalls, newCall];
      }
    });
  };

  // Fetch calls from API on a polling basis
  useEffect(() => {
    const fetchCalls = async () => {
      try {
        const response = await internalSdk.getPhoneCalls();
        response.data.phone_calls
          ?.sort((a, b) =>
            !!a.start_date_time && !!b.start_date_time
              ? new Date(b.start_date_time).getTime() - new Date(a.start_date_time).getTime()
              : 0
          )
          .forEach((call) => reconcileCalls(call));
      } catch (error) {
        console.error('Error fetching calls:', error);
      }
    };

    const intervalId = setInterval(fetchCalls, 5000); // Poll every 5 seconds
    fetchCalls(); // Initial fetch
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!authUser?.employee_id) {
      return;
    }

    // Open PhoneCalls connection
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnectionStatus('connected');
    ws.onclose = () => setConnectionStatus('disconnected');
    ws.onerror = () => setConnectionStatus('error');

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

  const handleIncomingMessage = (message) => {
    // Example logic for updating the state list
    setStateList((prevList) => {
      if (message.type === 'add') {
        return [...prevList, message.data];
      }
      if (message.type === 'remove') {
        return prevList.filter((item) => item.id !== message.data.id);
      }
      if (message.type === 'update') {
        return prevList.map((item) =>
          item.id === message.data.id ? { ...item, ...message.data } : item
        );
      }
      if (message.type === 'call_starting' || message.token) {
        reconcileCalls({
          phone_call_id: message.phone_call_id,
          start_date_time: message.start_date_time,
          phone_number: message.phone_number,
          // employee_id: message.employee_id,
        });
      }
      return prevList;
    });
  };

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

  const acceptCall = (data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(JSON.stringify(data));
    } else {
      console.error('PhoneCalls is not open. Unable to send message.');
    }
  };

  return (
    <PhoneCallsContext.Provider value={{ phoneCalls, sendMessage, connectionStatus }}>
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
