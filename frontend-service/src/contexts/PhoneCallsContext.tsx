import { createContext, useState, useEffect, useContext, useRef, PropsWithChildren } from 'react';
import { useAuth } from './AuthContext';

interface PhoneCallsContextProps {
  stateList: any[];
  sendMessage: (data: any) => void;
  connectionStatus: string;
}

// Create the AuthContext with initial values
export const PhoneCallsContext = createContext<PhoneCallsContextProps>({
  stateList: [],
  sendMessage: () => {},
  connectionStatus: 'disconnected',
});

interface PhoneCallsProviderProps extends PropsWithChildren {
  url: string;
}

export const PhoneCallsProvider = ({ url, children }: PhoneCallsProviderProps) => {
  const { authUser } = useAuth();
  const [stateList, setStateList] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!authUser?.userId) {
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
  }, [url, authUser?.userId]);

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
      return prevList;
    });
  };

  const sendMessage = (data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(JSON.stringify(data));
    } else {
      console.error('PhoneCalls is not open. Unable to send message.');
    }
  };

  return (
    <PhoneCallsContext.Provider value={{ stateList, sendMessage, connectionStatus }}>
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
