import { NotificationRepository } from "../repository/NotificationRepository";
import { NotificationCreateInput, NotificationUpdateInput } from "../repository/NotificationRepository";
import { NotificationType, Notification } from "../database/database";

export class NotificationService {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    public async createNotification(notification: NotificationCreateInput): Promise<Notification> {
        // !note! あとでエラー処理かく
        const createdNotification = await this.notificationRepository.create(notification);
        return createdNotification;
    }

    public async getNotificationsByUserId(userId: string): Promise<Notification[]> {
        const notifications = await this.notificationRepository.getByUserId(userId);
        return notifications;
    }

    public async getNotification(id: number): Promise<Notification | null> {
        const notification = await this.notificationRepository.get(id);
        return notification;
    }

    public async deleteNotification(id: number): Promise<void> {
        // !note! あとでエラー処理かく（他も）
        await this.notificationRepository.delete(id);
    }

    public async clearAllNotifications(): Promise<void> {
        await this.notificationRepository.clearAll();
    }

    public async markAsRead(id: number): Promise<void> {
        // !note! あとでエラー処理かく（他も）
        const updatedNotification = await this.notificationRepository.update(id, { isRead: true });
    }

    public async markAsReadByUserId(userId: string): Promise<void> {
        const notifications = await this.notificationRepository.getByUserId(userId);
        for (const notification of notifications) {
            await this.notificationRepository.update(notification.id, { isRead: true });
        }
    }

    public async createFollowNotification(userId: string, followingId: string): Promise<void> {
        await this.notificationRepository.create({
            userId: followingId,
            type: NotificationType.FOLLOW,
            title: 'フォローされました',
            message: `${userId} さんがあなたをフォローしました`,
            metadata: {
                followingId: userId
            }
        });
    }

    public async createFollowRequestNotification(fromUserId: string, toUserId: string): Promise<void> {
        await this.notificationRepository.create({
            userId: toUserId,
            type: NotificationType.FOLLOW_REQUEST,
            title: 'フォローリクエスト',
            message: `${fromUserId} さんからフォローリクエストが届きました`,
            metadata: {
                fromUserId: fromUserId
            }
        });
    }

    public async createFollowRequestAcceptedNotification(fromUserId: string, toUserId: string): Promise<void> {
        await this.notificationRepository.create({
            userId: fromUserId,
            type: NotificationType.FOLLOW_REQUEST_ACCEPTED,
            title: 'フォローリクエストが承認されました',
            message: `${toUserId} さんがあなたのフォローリクエストを承認しました`,
            metadata: {
                toUserId: toUserId
            }
        });
    }
}