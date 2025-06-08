import { Database , Event, User } from '../database/database';

export type EventCreateInput = {
    userId: string;
    name: string;
    startTime: Date;
    endTime: Date;
}

export type EventUpdateInput = {
    name?: string;
    startTime?: Date;
    endTime?: Date;
    isDone?: boolean;
}

export class EventRepository {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    public async create(event: EventCreateInput): Promise<Event> {
        return await Event.create({
            userId: event.userId,
            name: event.name,
            startTime: event.startTime,
            endTime: event.endTime,
            isDone: false
        });
    }

    public async delete(id: number): Promise<boolean> {
        const event = await Event.findByPk(id);
        if (!event) return false;
        await event.destroy();
        return true;
    }

    public async update(id: number, updateData: EventUpdateInput): Promise<Event | null> {
        const event = await Event.findByPk(id);
        if (!event) return null;
        await event.update(updateData);
        return event;
    }

    public async get(id: number): Promise<Event | null> {
        return await Event.findByPk(id);
    }

    public async getByUserId(userId: string): Promise<Event[]> {
        return await Event.findAll({
            where: {
                userId
            },
            order: [
                ['startTime', 'ASC']
            ]
        });
    }

    public async findAll(): Promise<Event[]> {
        return await Event.findAll();
    }

    public async clearAll(): Promise<void> {
        await Event.destroy({
            where: {}
        });
    }
}
