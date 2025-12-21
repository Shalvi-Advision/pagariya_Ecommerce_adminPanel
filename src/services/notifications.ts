import { apiClient } from 'src/utils/api-client';

interface SendNotificationToUserRequest {
    userId: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

interface SendNotificationToAllRequest {
    title: string;
    body: string;
    data?: Record<string, string>;
}

interface NotificationResponse {
    success: boolean;
    message: string;
    data?: any;
}

interface UserWithToken {
    _id: string;
    id?: string;
    name: string;
    mobile: string;
    email?: string;
    lastActiveAt?: string;
}

interface UsersWithTokensResponse {
    success: boolean;
    count: number;
    data: UserWithToken[];
}

// Send push notification to a specific user
export async function sendNotificationToUser(
    params: SendNotificationToUserRequest
): Promise<NotificationResponse> {
    return apiClient.post<NotificationResponse>('/api/admin/notifications/send-to-user', params);
}

// Send push notification to all users
export async function sendNotificationToAll(
    params: SendNotificationToAllRequest
): Promise<NotificationResponse> {
    return apiClient.post<NotificationResponse>('/api/admin/notifications/send-to-all', params);
}

// Get all users who have FCM tokens (can receive notifications)
export async function getUsersWithFcmTokens(): Promise<UsersWithTokensResponse> {
    return apiClient.get<UsersWithTokensResponse>('/api/admin/notifications/users');
}
