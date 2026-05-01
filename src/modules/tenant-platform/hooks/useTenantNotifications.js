import { useState, useEffect, useCallback, useRef } from 'react';
import { getAccessToken, apiClient } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useTenantNotifications = (tenantSlug) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    
    // Add a state specifically to trigger toast pops
    const [latestNotification, setLatestNotification] = useState(null);

    const eventSourceRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef(null);

    // Initial Fetch: Get history from API
    const fetchHistory = useCallback(async () => {
        if (!tenantSlug) return;
        try {
            const data = await apiClient('/notifications/', { method: 'GET', auth: true, slug: tenantSlug });
            const list = data.results ?? [];
            setNotifications(list);
            const count = list.filter(n => !n.is_read).length;
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to load tenant notification history", error);
        } finally {
            setLoading(false);
        }
    }, [tenantSlug]);

    // SSE Connection Logic
    const connectSSE = useCallback(async () => {
        if (!tenantSlug) return;

        // Close existing connection if any
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }

        const token = getAccessToken();
        if (!token) {
            console.error("No access token available for tenant SSE stream.");
            return;
        }

        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        const streamUrl = `${baseUrl}/notifications/tenant-stream/?token=${token}`;
        
        console.log(`📡 [SSE] Attempting connection to: ${streamUrl}`);
        
        try {
            const es = new EventSource(streamUrl);
            eventSourceRef.current = es;

            es.onopen = () => {
                console.log("✅ [SSE] Tenant Notification stream connected successfully.");
                setIsConnected(true);
                reconnectAttemptsRef.current = 0; // Reset backoff on success
            };

            es.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Ignore heartbeats/pings
                    if (data.type === 'heartbeat' || data.type === 'ping') return;

                    // Deduplicate and push new event
                    setNotifications(prev => {
                        // Avoid double-counting/double-renders if the event fires twice
                        if (prev.some(n => n.id === data.id)) return prev;
                        
                        setUnreadCount(c => c + 1);
                        setLatestNotification(data);
                        return [{ ...data, is_read: false }, ...prev];
                    });
                    
                    console.log("New Tenant Notification:", data.message);
                } catch (err) {
                    console.error("Error parsing Tenant SSE data", err);
                }
            };

            es.onerror = async (err) => {
                console.error("Tenant SSE Connection Error. Attempting recovery...");
                setIsConnected(false);
                es.close();

                // Exponential Backoff Reconnection
                const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                reconnectAttemptsRef.current += 1;
                
                console.log(`Reconnecting in ${backoffDelay}ms... (Attempt ${reconnectAttemptsRef.current})`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    connectSSE();
                }, backoffDelay);
            };
        } catch (initErr) {
            console.error("❌ [SSE] Failed to initialize Tenant EventSource:", initErr);
            setIsConnected(false);
        }
    }, [tenantSlug]);

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
            await apiClient(`/notifications/${id}/mark_read/`, { method: 'PATCH', auth: true, slug: tenantSlug });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read", err);
        }
    };

    const markAllRead = async () => {
        try {
            await apiClient("/notifications/mark_all_read/", { method: 'PATCH', auth: true, slug: tenantSlug });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all notifications as read", err);
        }
    };

    const clearLatestNotification = () => setLatestNotification(null);

    return {
        notifications,
        unreadCount,
        loading,
        isConnected,
        latestNotification,
        markAsRead,
        markAllRead,
        clearLatestNotification,
        refreshHistory: fetchHistory
    };
};
