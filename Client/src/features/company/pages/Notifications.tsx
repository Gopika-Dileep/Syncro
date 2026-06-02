import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Eye, Clock, Bell, Filter } from "lucide-react";
import { toast } from "sonner";
import { 
    getNotificationsApi, 
    markAsReadApi, 
    markAllAsReadApi, 
    type Notification 
} from "../../employee/api/notificationApi";

const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "Y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "MO ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "D ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "H ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "M ago";
    return Math.floor(seconds) + "S ago";
};

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('unread');

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getNotificationsApi(1, 100); 
            if (res.success && res.data) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch {
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const handleUpdate = () => fetchNotifications();
        window.addEventListener('notification_update', handleUpdate);
        return () => window.removeEventListener('notification_update', handleUpdate);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsReadApi(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            toast.error("Failed to update notification");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsReadApi();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All notifications marked as read");
        } catch {
            toast.error("Failed to update notifications");
        }
    };

    const handleViewDetails = (n: Notification) => {
        if (n.relatedEntityId) {
            const path = n.relatedEntityType === 'Issue' ? '/employee/backlogs' : '/employee/tasks';
            const param = n.relatedEntityType === 'Issue' ? 'selectedIssue' : 'selectedTask';
            navigate(`${path}?${param}=${n.relatedEntityId}`);
        } else if (n.link) {
            navigate(n.link);
        }
    };

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            const matchesFilter = filter === 'all' || !n.isRead;
            return matchesFilter;
        });
    }, [notifications, filter]);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#fcfcfc] flex flex-col w-full">
            {/* Header / Search Bar */}
            <div className="px-8 py-4 bg-white border-b border-[#eee] flex flex-col gap-4 sticky top-0 z-20 shadow-sm w-full">
                <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                        <h1 className="text-[16px] font-black text-[#1f2124] tracking-tight flex items-center gap-2">
                            Notifications
                            <div className="w-1 h-1 rounded-full bg-[#fa8029]" />
                        </h1>
                        <p className="text-[9px] font-bold text-[#aaa] uppercase tracking-[0.1em]">System & Oversight Alerts</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0}
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#f9fafb] text-[#555] hover:text-[#fa8029] hover:bg-[#fff5ef] border border-[#eee] rounded-lg text-[10px] font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <Check size={12} className="group-hover:scale-110 transition-transform" />
                            Mark All Read
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <div className="inline-flex bg-[#f5f5f5] p-0.5 rounded-[12px] border border-[#eee]">
                        <button 
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-1.5 rounded-[10px] text-[10px] font-black transition-all flex items-center gap-1.5 ${filter === 'unread' ? 'bg-white text-[#fa8029] shadow-sm' : 'text-[#aaa] hover:text-[#555]'}`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="flex items-center justify-center min-w-[14px] h-[14px] px-1 rounded-full bg-[#fa8029]/10 text-[#fa8029] text-[8px]">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-[10px] text-[10px] font-black transition-all ${filter === 'all' ? 'bg-white text-[#fa8029] shadow-sm' : 'text-[#aaa] hover:text-[#555]'}`}
                        >
                            All Logs
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 p-6 w-full max-w-full">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-16 bg-white border border-[#eee] rounded-[16px] animate-pulse" />
                        ))}
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="grid gap-2">
                        {filteredNotifications.map((n) => (
                            <div 
                                key={n._id}
                                className={`group bg-white rounded-[16px] border transition-all duration-200 flex items-center p-3.5 gap-4 hover:shadow-md hover:shadow-gray-200/20 ${n.isRead ? 'border-[#eee] opacity-60' : 'border-[#fa8029]/10 ring-1 ring-[#fa8029]/2 shadow-sm'}`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${n.isRead ? 'bg-gray-50 text-gray-400' : 'bg-[#fff5ef] text-[#fa8029]'}`}>
                                    <Bell size={16} className={n.isRead ? "" : "animate-bounce-subtle"} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-0.5">
                                        <h3 className={`text-[13px] font-black tracking-tight truncate ${n.isRead ? 'text-gray-500' : 'text-[#1f2124]'}`}>{n.title}</h3>
                                        <span className="text-[8px] font-black text-[#ccc] flex items-center gap-1 shrink-0 bg-gray-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                            <Clock size={8} />
                                            {formatTimeAgo(new Date(n.createdAt))}
                                        </span>
                                    </div>
                                    <p className={`text-[11px] line-clamp-1 leading-relaxed ${n.isRead ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                                        {n.message}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {(n.relatedEntityId || n.link) && (
                                        <button 
                                            onClick={() => handleViewDetails(n)}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-50 text-[#555] hover:bg-[#fa8029] hover:text-white rounded-lg transition-all border border-[#eee]"
                                            title="View Details"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    )}
                                    {!n.isRead && (
                                        <button 
                                            onClick={() => handleMarkAsRead(n._id)}
                                            className="w-8 h-8 flex items-center justify-center bg-[#fa8029] text-white hover:bg-[#e67324] rounded-lg transition-all shadow-sm"
                                            title="Mark as Read"
                                        >
                                            <Check size={14} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-14 h-14 bg-white rounded-[20px] flex items-center justify-center mb-4 shadow-sm border border-[#eee]">
                            <Filter size={20} className="text-[#fa8029] opacity-20" />
                        </div>
                        <h3 className="text-[14px] font-black text-[#1f2124]">No notifications</h3>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">Everything is up to date.</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-2px); }
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
