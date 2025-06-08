import { Event } from "../database/database";
import { EventRepository, EventCreateInput, EventUpdateInput } from "../repository/eventRepository";
import { UserRepository } from "../repository/userRepository";
import { SessionManager } from "../repository/sessionManager";
import { UserNotFoundError, InvalidTimeRangeError, TimeConflictError, EventNotFoundError } from "./errors";

export class EventService {
    constructor(private readonly eventRepository: EventRepository,
         private readonly userRepository: UserRepository,
         private readonly sessionManager: SessionManager) {
    }

    public async createEvent(event: EventCreateInput): Promise<Event> {
        if (!await this.userRepository.exists(event.userId)) {
            throw new UserNotFoundError(event.userId);
        }
        if (event.startTime >= event.endTime) {
            throw new InvalidTimeRangeError();
        }
        // スケジュールの時間重複チェック
        const events = await this.eventRepository.getByUserId(event.userId);
        for (const e of events) {
            if (event.startTime < e.endTime && event.endTime > e.startTime) {
                throw new TimeConflictError();
            }
        }
        const createdEvent = await this.eventRepository.create(event);
        return createdEvent;
    }

    public async getEvent(eventId: number): Promise<Event> {
        const event = await this.eventRepository.get(eventId);
        if (!event) {
            throw new EventNotFoundError(eventId);
        }
        return event;
    }

    public async getEventsByUserId(userId: string): Promise<Event[]> {
        if (!await this.userRepository.exists(userId)) {
            throw new UserNotFoundError(userId);
        }
        const events = await this.eventRepository.getByUserId(userId);
        return events;
    }

    public async updateEvent(eventId: number, updateData: EventUpdateInput): Promise<Event> {
        const updatedEvent = await this.eventRepository.update(eventId, updateData);
        if (!updatedEvent) {
            throw new EventNotFoundError(eventId);
        }
        return updatedEvent;
    }

    public async deleteEvent(eventId: number): Promise<boolean> {
        const deleted = await this.eventRepository.delete(eventId);
        if (!deleted) {
            throw new EventNotFoundError(eventId);
        }
        return deleted;
    }
}