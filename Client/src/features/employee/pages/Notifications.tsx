import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Eye, Clock, Bell } from "lucide-react";
import { toast } from "sonner";
import { 
    getNotificationsApi, 
    markAsReadApi, 
    markAllAsReadApi, 
    type Notification 
} from "../api/notificationApi";

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
            const res = await getNotificationsApi(1, 50);
            if (res.success && res.data) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch (err) {
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
        } catch (err) {
            toast.error("Failed to update notification");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsReadApi();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All caught up!");
        } catch (err) {
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

    const filteredNotifications = notifications.filter(n => {
        return filter === 'all' || !n.isRead;
    });

    return (
        <div className="w-full min-h-screen bg-[#fcfcfc] flex flex-col">
            {/* Header Tabs - Compact & Full Width */}
            <div className="flex items-center justify-between px-8 py-4 sticky top-0 bg-white/90 backdrop-blur-md z-20 border-b border-[#eee]">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-[12px] font-black transition-all ${filter === 'unread' ? 'bg-[#fa8029] text-white shadow-md shadow-orange-100' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                    >
                        Unread
                        <span className={`flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] ${filter === 'unread' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {unreadCount}
                        </span>
                    </button>
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-6 py-1.5 rounded-full text-[12px] font-black transition-all ${filter === 'all' ? 'bg-[#fa8029] text-white shadow-md shadow-orange-100' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                    >
                        All
                    </button>
                </div>

                <button 
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="w-9 h-9 flex items-center justify-center bg-[#fa8029] text-white rounded-xl hover:bg-[#e67324] transition-all shadow-md shadow-orange-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mark all as read"
                >
                    <Check size={18} strokeWidth={3} />
                </button>
            </div>

            {/* Notification List - Full Width & Smaller Fonts */}
            <div className="p-6 w-full">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 bg-white border border-gray-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="grid gap-2.5">
                        {filteredNotifications.map((n) => (
                            <div 
                                key={n._id}
                                className={`group bg-white rounded-2xl border p-4 transition-all duration-200 flex items-center gap-4 hover:shadow-sm ${n.isRead ? 'border-gray-100 opacity-60' : 'border-[#fa8029]/10 shadow-sm'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-50 text-gray-400' : 'bg-[#fff5ef] text-[#fa8029]'}`}>
                                    <Bell size={18} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`text-[14px] font-black tracking-tight truncate ${n.isRead ? 'text-gray-500' : 'text-[#1f2124]'}`}>{n.title}</h3>
                                            {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-[#fa8029]" />}
                                        </div>
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
                                            <Clock size={10} />
                                            {formatTimeAgo(new Date(n.createdAt))}
                                        </span>
                                    </div>
                                    <p className={`text-[12px] line-clamp-1 ${n.isRead ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                                        {n.message}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {(n.relatedEntityId || n.link) && (
                                        <button 
                                            onClick={() => handleViewDetails(n)}
                                            className="w-9 h-9 flex items-center justify-center border-2 border-[#1f2124]/5 hover:border-[#1f2124]/10 hover:bg-[#1f2124]/5 text-[#1f2124] rounded-xl transition-all"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    )}
                                    {!n.isRead && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n._id); }}
                                            className="w-9 h-9 flex items-center justify-center bg-[#fa8029] hover:bg-[#e67324] text-white rounded-xl transition-all shadow-sm"
                                            title="Mark as read"
                                        >
                                            <Check size={16} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                            <Check size={28} className="text-[#fa8029] opacity-20" />
                        </div>
                        <h3 className="text-[16px] font-black text-[#1f2124]">All Clear!</h3>
                        <p className="text-[12px] text-gray-400 font-medium mt-1">No new notifications in this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
