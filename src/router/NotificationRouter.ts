import { AbstractRouter } from "./AbstractRouter";
import { NotificationController } from "../controller/NotificationController";
import { Request, Response } from "express";

export class NotificationRouter extends AbstractRouter {
    constructor(private notificationController: NotificationController) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        this.router.get('/', async (req: Request, res: Response) => this.notificationController.getNotifications(req, res));
        this.router.put('/read', async (req: Request, res: Response) => this.notificationController.markAsRead(req, res));
    }
}