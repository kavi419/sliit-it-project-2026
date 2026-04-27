import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './AuthContext';
import api from '../utils/axiosConfig';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const stompClientRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
      
      const countRes = await api.get('/api/notifications/unread-count');
      setUnreadCount(countRes.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      
      const client = new Client({
        brokerURL: 'ws://localhost:8080/ws',
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        setConnected(true);
        console.log('Connected to WebSocket');

        client.subscribe(`/user/${user.id}/queue/notifications`, (message) => {
          const newNotification = JSON.parse(message.body);
          setNotifications(prev => [newNotification, ...prev]);
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Smart Campus Hub', {
              body: newNotification.message,
            });
          }
        });

        client.subscribe(`/user/${user.id}/queue/unread-count`, (message) => {
          setUnreadCount(parseInt(message.body));
        });
      };

      client.onWebSocketClose = () => {
        setConnected(false);
      };

      client.activate();
      stompClientRef.current = client;

      return () => {
        if (stompClientRef.current) {
          stompClientRef.current.deactivate();
        }
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setConnected(false);
    }
  }, [user?.id, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      const countRes = await api.get('/api/notifications/unread-count');
      setUnreadCount(countRes.data);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      fetchNotifications,
      connected
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
