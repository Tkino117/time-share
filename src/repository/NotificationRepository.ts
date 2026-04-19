import { Database, Notification, NotificationType } from '../database/database';

export type NotificationCreateInput = {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    imageUrl?: string;
    metadata?: object;
}

export type NotificationUpdateInput = {
    isRead?: boolean;
    metadata?: object;
}

export class NotificationRepository {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    public async create(notification: NotificationCreateInput): Promise<Notification> {
        if (!notification.imageUrl) {
            notification.imageUrl = '/images/alerm.png';
        }
        return await Notification.create({
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            metadata: notification.metadata,
            imageUrl: notification.imageUrl
        });
    }

    public async delete(id: number): Promise<boolean> {
        const notification = await Notification.findByPk(id);
        if (!notification) return false;
        await notification.destroy();
        return true;
    }

    public async exists(id: number): Promise<boolean> {
        const notification = await Notification.findByPk(id);
        return notification !== null;
    }

    public async get(id: number): Promise<Notification | null> {
        return await Notification.findByPk(id);
    }

    public async getByUserId(userId: string): Promise<Notification[]> {
        return await Notification.findAll({ where: { userId } });
    }

    public async findAll(): Promise<Notification[]> {
        return await Notification.findAll();
    }

    public async clearAll(): Promise<void> {
        await Notification.destroy({ where: {} });
    }

    public async update(id: number, updateData: NotificationUpdateInput): Promise<Notification | null> {
        const notification = await Notification.findByPk(id);
        if (!notification) return null;
        await notification.update(updateData);
        return notification;
    }
}