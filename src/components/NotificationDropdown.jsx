import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * NotificationDropdown Component
 * Displays a list of recent notifications with mark-as-read functionality.
 */
const NotificationDropdown = ({ 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllRead, 
    isConnected,
    loading 
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Filter to show only the last 10 notifications in the dropdown
    const displayNotifications = notifications.slice(0, 10);

    const getIconColor = (type) => {
        switch (type?.toUpperCase()) {
            case 'ERROR': return 'text-red-500';
            case 'WARNING': return 'text-orange-500';
            case 'SUCCESS': return 'text-green-500';
            case 'SECURITY': return 'text-purple-500';
            default: return 'text-blue-500';
        }
    };

    const getIconName = (type) => {
        switch (type?.toUpperCase()) {
            case 'ERROR': return 'error';
            case 'WARNING': return 'warning';
            case 'SUCCESS': return 'check_circle';
            case 'SECURITY': return 'shield_lock';
            default: return 'info';
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="hover:text-[#0e141b] relative p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                title="Notifications"
            >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center animate-in fade-in scale-in-0 duration-200">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
                {/* Connection Status Dot (Small subtle indicator) */}
                <span className={`absolute bottom-0 right-0 size-2 rounded-full border border-white ${isConnected ? 'bg-green-500' : 'bg-slate-300 animate-pulse'}`}></span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-[#d0dbe7] z-20 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                        
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-[#d0dbe7] flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-sm font-bold text-[#0e141b]">Notifications</h3>
                                <p className="text-[10px] text-[#4e7397]">
                                    {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={() => { markAllRead(); setIsOpen(false); }}
                                    className="text-xs font-bold text-primary hover:underline"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                    <p className="text-xs text-[#4e7397]">Syncing alerts...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <span className="material-symbols-outlined text-slate-200 text-4xl mb-2">notifications_off</span>
                                    <p className="text-xs text-[#4e7397] font-medium">All caught up!</p>
                                    <p className="text-[10px] text-slate-400">No new notifications.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {displayNotifications.map((notification) => (
                                        <li 
                                            key={notification.id}
                                            className={`group relative flex gap-3 p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                                            onClick={() => {
                                                if (!notification.is_read) markAsRead(notification.id);
                                            }}
                                        >
                                            {!notification.is_read && (
                                                <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></span>
                                            )}
                                            
                                            <div className={`shrink-0 mt-0.5 ${getIconColor(notification.type)}`}>
                                                <span className="material-symbols-outlined text-xl">
                                                    {getIconName(notification.type)}
                                                </span>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs leading-relaxed ${!notification.is_read ? 'text-[#0e141b] font-bold' : 'text-[#4e7397]'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>

                                            {!notification.is_read && (
                                                <div className="shrink-0 flex items-center">
                                                    <div className="size-2 bg-primary rounded-full"></div>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-2 border-t border-[#d0dbe7] bg-slate-50 text-center">
                            <Link 
                                to="/dashboard/audit" 
                                className="text-[11px] font-bold text-primary hover:text-blue-700 transition-colors block py-1"
                                onClick={() => setIsOpen(false)}
                            >
                                View full history in audit logs
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationDropdown;
