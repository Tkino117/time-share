import { EventService } from "../service/EventService";
import { Request, Response } from "express";
import { auth, handleError } from "./util";
import { SessionManager } from "../repository/SessionManager";
import { EmptyResponseData, EventResponseData, SuccessResponse } from "../response";
import { AuthError, InvalidEventIdError, InvalidEventTypeError } from "../service/errors";
import { EventType } from "../database/database";

export class EventController {
    constructor(private eventService: EventService, private sessionManager: SessionManager) {
    }

    async createEvent(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const name = req.body.name;
            const startTime = req.body.startTime ? new Date(req.body.startTime) : undefined;
            const endTime = req.body.endTime ? new Date(req.body.endTime) : undefined;
            const type = this.convertType(req.body.type);
            const event = await this.eventService.createEvent({
                userId: userId,
                name: name,
                startTime: startTime,
                endTime: endTime,
                type: type,
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
            const eventId = parseInt(req.params.eventId);
            if (isNaN(eventId)) {
                throw new InvalidEventIdError(eventId);
            }
            const event = await this.eventService.getEvent(eventId);
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
            if (isNaN(eventId)) {
                throw new InvalidEventIdError(eventId);
            }
            const name = req.body.name;
            const startTime = req.body.startTime ? new Date(req.body.startTime) : undefined;
            const endTime = req.body.endTime ? new Date(req.body.endTime) : undefined;
            const type = req.body.type ? this.convertType(req.body.type) : undefined;
            const event = await this.eventService.updateEvent(eventId, {
                name: name,
                startTime: startTime,
                endTime: endTime,
                type: type,
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
            if (isNaN(eventId)) {
                throw new InvalidEventIdError(eventId);
            }
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

    private convertType(type: string | undefined): EventType {
        switch (type) {
            case 'meal':
                return EventType.MEAL;
            case 'sleep':
                return EventType.SLEEP;
            case 'work':
                return EventType.WORK;
            case 'exercise':
                return EventType.EXERCISE;
            case 'study':
                return EventType.STUDY;
            case 'other':
            case '':
            case undefined:
                return EventType.OTHER;
            default:
                throw new InvalidEventTypeError(type);
        }
    }
}