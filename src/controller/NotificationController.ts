import { Request, Response } from "express";
import { EmptyResponseData, NotificationsResponseData, SuccessResponse } from "../response";
import { NotificationService } from "../service";
import { auth, handleError } from "./util";
import { SessionManager } from "../repository";

export class NotificationController {
    constructor(private notificationService: NotificationService, private sessionManager: SessionManager) {
    }

    async getNotifications(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const notifications = await this.notificationService.getNotificationsByUserId(userId);
            const data = new NotificationsResponseData(notifications);
            new SuccessResponse(data, 'Notifications fetched successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async markAsRead(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            await this.notificationService.markAsReadByUserId(userId);
            new SuccessResponse(new EmptyResponseData(), 'Notifications marked as read successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }
}