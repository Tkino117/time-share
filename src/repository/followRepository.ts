import { Database, Follow } from '../database/database';

export class FollowRepository {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    public async create(followee: string, follower: string): Promise<Follow> {
        return await Follow.create({
            followee,
            follower
        });
    }

    public async delete(followee: string, follower: string): Promise<boolean> {
        const follow = await Follow.findOne({
            where: {
                followee,
                follower
            }
        });
        if (!follow) return false;
        await follow.destroy();
        return true;
    }

    public async exists(followee: string, follower: string): Promise<boolean> {
        const follow = await Follow.findOne({
            where: {
                followee,
                follower
            }
        });
        return follow !== null;
    }

    public async getFollowees(userId: string): Promise<string[]> {
        const follows = await Follow.findAll({
            where: {
                follower: userId
            }
        });
        return follows.map(follow => follow.followee);
    }

    public async getFollowers(userId: string): Promise<string[]> {
        const follows = await Follow.findAll({
            where: {
                followee: userId
            }
        });
        return follows.map(follow => follow.follower);
    }

    public async findAll(): Promise<Follow[]> {
        return await Follow.findAll();
    }   

    public async clearAll(): Promise<void> {
        await Follow.destroy({
            where: {}
        });
    }
}
