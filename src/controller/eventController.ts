import { EventService } from "../service/eventService";
import { Request, Response } from "express";
import { auth, handleError } from "./util";
import { SessionManager } from "../repository/sessionManager";
import { EmptyResponseData, EventResponseData, SuccessResponse } from "../response";
import { AuthError } from "../service/errors";

export class EventController {
    constructor(private eventService: EventService, private sessionManager: SessionManager) {
    }

    async createEvent(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const name = req.body.name;
            const startTime = req.body.startTime ? new Date(req.body.startTime) : undefined;
            const endTime = req.body.endTime ? new Date(req.body.endTime) : undefined;
            const event = await this.eventService.createEvent({
                userId: userId,
                name: name,
                startTime: startTime,
                endTime: endTime,
            });
            const data = new EventResponseData(event);
            new SuccessResponse(data, 'Event created successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    // イベント取得（自分のイベントのみ認証可にしてる）
    async getEvent(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const event = await this.eventService.getEvent(parseInt(req.params.eventId));
            if (event.userId !== userId) {
                throw new AuthError();
            }
            const data = new EventResponseData(event);
            new SuccessResponse(data, 'Event retrieved successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async updateEvent(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const eventId = parseInt(req.params.eventId);
            const name = req.body.name;
            const startTime = req.body.startTime ? new Date(req.body.startTime) : undefined;
            const endTime = req.body.endTime ? new Date(req.body.endTime) : undefined;
            const event = await this.eventService.updateEvent(eventId, {
                name: name,
                startTime: startTime,
                endTime: endTime,
            });
            const data = new EventResponseData(event);
            new SuccessResponse(data, 'Event updated successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async deleteEvent(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const eventId = parseInt(req.params.eventId);
            const event = await this.eventService.getEvent(eventId);
            if (event.userId !== userId) {
                throw new AuthError();
            }
            await this.eventService.deleteEvent(eventId);
            new SuccessResponse(new EmptyResponseData(), 'Event deleted successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }
}