import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Eye, Clock } from "lucide-react";
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
        <div className="max-w-4xl mx-auto py-4 px-6 min-h-screen bg-[#f8f9fa]">
            {/* Header Tabs */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#f8f9fa]/80 backdrop-blur-md py-4 z-20">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setFilter('unread')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-black transition-all ${filter === 'unread' ? 'bg-[#fa8029] text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                    >
                        Unread
                        <span className={`flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] ${filter === 'unread' ? 'bg-black/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {unreadCount}
                        </span>
                    </button>
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-8 py-2.5 rounded-full text-[13px] font-black transition-all ${filter === 'all' ? 'bg-[#fa8029] text-white shadow-lg shadow-orange-200' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                    >
                        All
                    </button>
                </div>

                <button 
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="w-11 h-11 flex items-center justify-center bg-[#fa8029] text-white rounded-full hover:bg-[#e67324] transition-all shadow-lg shadow-orange-100 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    title="Mark all as read"
                >
                    <Check size={20} strokeWidth={3} />
                </button>
            </div>

            {/* Notification List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-white border border-gray-100 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="space-y-4 pb-12">
                        {filteredNotifications.map((n) => (
                            <div 
                                key={n._id}
                                className={`bg-white rounded-[2.5rem] border p-7 transition-all ${n.isRead ? 'border-gray-100 opacity-80' : 'border-[#fa8029]/10 shadow-xl shadow-gray-200/20'}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`text-[17px] font-black tracking-tight ${n.isRead ? 'text-gray-500' : 'text-[#1f2124]'}`}>{n.title}</h3>
                                        {!n.isRead && <div className="w-2 h-2 rounded-full bg-[#fa8029] ml-1" />}
                                    </div>
                                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-full">
                                        <Clock size={12} />
                                        {formatTimeAgo(new Date(n.createdAt))}
                                    </span>
                                </div>
                                
                                <div className="mb-6">
                                    <p className={`text-[14px] leading-relaxed ${n.isRead ? 'text-gray-400' : 'text-gray-600 font-medium'}`}>
                                        {n.message}
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-end gap-3">
                                    {(n.relatedEntityId || n.link) && (
                                        <button 
                                            onClick={() => handleViewDetails(n)}
                                            className="px-6 py-2.5 border-2 border-[#1f2124]/5 hover:border-[#1f2124]/10 hover:bg-[#1f2124]/5 text-[#1f2124] text-[12px] font-black rounded-2xl transition-all uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <Eye size={14} />
                                            View Details
                                        </button>
                                    )}
                                    {!n.isRead && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleMarkAsRead(n._id); }}
                                            className="px-6 py-2.5 bg-[#fa8029] hover:bg-[#e67324] text-white text-[12px] font-black rounded-2xl transition-all shadow-md shadow-orange-100 uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <Check size={14} strokeWidth={3} />
                                            Mark as read
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                            <Check size={32} className="text-[#fa8029] opacity-20" />
                        </div>
                        <h3 className="text-[18px] font-black text-[#1f2124]">All Clear!</h3>
                        <p className="text-[14px] text-gray-400 font-medium mt-1">No new notifications in this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
