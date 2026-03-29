import { useState, useEffect, useCallback, useRef } from 'react';
import notificationService from '../services/notificationService';
import authService from '../services/authService';

import { API_URL } from '../services/api';

const API_BASE_URL = API_URL;

/**
 * useNotifications Hook
 * Manages notification state, real-time SSE stream, and automatic token refresh/reconnection.
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    
    const eventSourceRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef(null);

    // Initial Fetch: Get history from API
    const fetchHistory = useCallback(async () => {
        if (!authService.isAuthenticated()) return;
        
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            const count = data.filter(n => !n.is_read).length;
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to load notification history", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // SSE Connection Logic
    const connectSSE = useCallback(async () => {
        if (!authService.isAuthenticated()) return;

        // Close existing connection if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const token = authService.getAccessToken();
        if (!token) {
            console.error("No access token available for SSE stream.");
            return;
        }

        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const streamUrl = `${baseUrl}/notifications/stream/?token=${token}`;
        
        console.log(`📡 [SSE] Attempting connection to: ${streamUrl}`);
        
        try {
            const es = new EventSource(streamUrl);
            eventSourceRef.current = es;

            es.onopen = () => {
                console.log("✅ [SSE] Notification stream connected successfully.");
                setIsConnected(true);
                reconnectAttemptsRef.current = 0; // Reset backoff on success
            };
        } catch (initErr) {
            console.error("❌ [SSE] Failed to initialize EventSource:", initErr);
            setIsConnected(false);
        }

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Ignore heartbeats/pings
                if (data.type === 'heartbeat' || data.type === 'ping') return;

                // Handle new notification
                setNotifications(prev => [data, ...prev]);
                if (!data.is_read) {
                    setUnreadCount(prev => prev + 1);
                }

                // Optional: Show browser notification or UI Toast here
                console.log("New Notification:", data.message);
            } catch (err) {
                console.error("Error parsing SSE data", err);
            }
        };

        es.onerror = async (err) => {
            console.error("SSE Connection Error. Attempting recovery...");
            setIsConnected(false);
            es.close();

            // Handle potential 401/403 by refreshing token
            try {
                await authService.refreshToken();
                console.log("Token refreshed after SSE error.");
            } catch (refreshErr) {
                console.error("Token refresh failed during SSE recovery", refreshErr);
                // If refresh fails, we stop reconnecting (authService will handle logout if needed)
                return;
            }

            // Exponential Backoff Reconnection
            const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            reconnectAttemptsRef.current += 1;
            
            console.log(`Reconnecting in ${backoffDelay}ms... (Attempt ${reconnectAttemptsRef.current})`);
            reconnectTimeoutRef.current = setTimeout(() => {
                connectSSE();
            }, backoffDelay);
        };
    }, []);

    useEffect(() => {
        fetchHistory();
        connectSSE();

        return () => {
            if (eventSourceRef.current) eventSourceRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [fetchHistory, connectSSE]);

    // UI Actions
    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all notifications as read", err);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        isConnected,
        markAsRead,
        markAllRead,
        refreshHistory: fetchHistory
    };
};
