import { Database , Event, User } from '../database/database';

export class EventRepository {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    /**
     * イベントを作成する
     * @param userId ユーザーID
     * @param name イベント名
     * @param startTime 開始時間
     * @param endTime 終了時間
     * @returns 作成されたイベント
     */
    public async create(userId: string, name: string, startTime: Date, endTime: Date) {
        return await Event.create({
            userId,
            name,
            startTime,
            endTime,
            isDone: false
        });
    }

    /**
     * イベントを削除する
     * @param id イベントID
     */
    public async delete(id: number): Promise<void> {
        await Event.destroy({
            where: {
                id
            }
        });
    }

    /**
     * イベントを更新する
     * @param id イベントID
     * @param name イベント名
     * @param startTime 開始時間
     * @param endTime 終了時間
     * @param isDone 完了フラグ
     */
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

    /**
     * イベントを取得する
     * @param id イベントID
     * @returns イベント
     */
    public async get(id: number) {
        return await Event.findByPk(id);
    }

    /**
     * ユーザーのイベント一覧を取得する
     * @param userId ユーザーID
     * @returns イベント一覧
     */
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
