import axiosInstance from "@/features/shared/api/axiosinstance";

export interface Notification {
    _id: string;
    recipient: string;
    sender?: {
        _id: string;
        name: string;
        avatar?: string;
    };
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
}

export interface GetNotificationsResponse {
    notifications: Notification[];
    total: number;
    unreadCount: number;
}

export const getNotificationsApi = async (page = 1, limit = 50) => {
    const response = await axiosInstance.get<{ success: boolean; data: GetNotificationsResponse }>(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
};

export const markAsReadApi = async (id: string) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
};

export const markAllAsReadApi = async () => {
    const response = await axiosInstance.patch(`/notifications/read-all`);
    return response.data;
};
