import { Database , Event, User } from '../database/database';

export class EventRepository {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    public async create(userId: string, name: string, startTime: Date, endTime: Date): Promise<Event> {
        return await Event.create({
            userId,
            name,
            startTime,
            endTime,
            isDone: false
        });
    }

    public async delete(id: number): Promise<boolean> {
        const event = await Event.findByPk(id);
        if (!event) return false;
        await event.destroy();
        return true;
    }

    public async update(id: number, name?: string, startTime?: Date, endTime?: Date, isDone?: boolean): Promise<Event | null> {
        const updateData: any = {};
        
        if (name !== undefined) updateData.name = name;
        if (startTime !== undefined) updateData.startTime = startTime;
        if (endTime !== undefined) updateData.endTime = endTime;
        if (isDone !== undefined) updateData.isDone = isDone;

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
}
