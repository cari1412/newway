import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, List } from '@telegram-apps/telegram-ui';

interface RequestLog {
  url: string;
  method: string;
  data?: any;
  timestamp: Date;
}

const ApiDebugger: React.FC = () => {
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const newRequest: RequestLog = {
          url: config.url || '',
          method: config.method?.toUpperCase() || '',
          data: config.data,
          timestamp: new Date()
        };
        setRequests(prev => [...prev, newRequest]);
        return config;
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        setRequests(prev => [
          ...prev,
          {
            url: response.config.url || '',
            method: 'RESPONSE',
            data: response.data,
            timestamp: new Date()
          }
        ]);
        return response;
      },
      (error) => {
        setRequests(prev => [
          ...prev,
          {
            url: error.config?.url || '',
            method: 'ERROR',
            data: error.response?.data || error.message,
            timestamp: new Date()
          }
        ]);
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-lg shadow-lg z-50"
        onClick={() => setIsVisible(true)}
      >
        🔍 Debug API
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[80vh] shadow-xl z-50">
      <Card>
        <div className="p-2 flex justify-between items-center border-b">
          <h3 className="font-bold">API Debug</h3>
          <button onClick={() => setIsVisible(false)} className="px-2">✕</button>
        </div>
        <List className="overflow-y-auto max-h-[60vh]">
          {requests.map((req, index) => (
            <div key={index} className="p-2 border-b">
              <div className="flex justify-between items-center mb-1">
                <span className={`px-2 py-1 rounded text-sm ${
                  req.method === 'GET' ? 'bg-green-100' :
                  req.method === 'POST' ? 'bg-blue-100' :
                  req.method === 'ERROR' ? 'bg-red-100' :
                  'bg-gray-100'
                }`}>
                  {req.method}
                </span>
                <span className="text-xs opacity-70">
                  {req.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="text-sm break-all">{req.url}</div>
              {req.data && (
                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(req.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </List>
      </Card>
    </div>
  );
};

export default ApiDebugger;