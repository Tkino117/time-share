import { Database, Follow } from '../database/database';

export type FollowCreateInput = {
    following: string;
    follower: string;
}

export class FollowRepository {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    public async create(follow: FollowCreateInput): Promise<Follow> {
        return await Follow.create({
            following: follow.following,
            follower: follow.follower
        });
    }

    public async delete(following: string, follower: string): Promise<boolean> {
        const follow = await Follow.findOne({
            where: {
                following,
                follower
            }
        });
        if (!follow) return false;
        await follow.destroy();
        return true;
    }

    public async exists(following: string, follower: string): Promise<boolean> {
        const follow = await Follow.findOne({
            where: {
                following,
                follower
            }
        });
        return follow !== null;
    }

    public async getFollowings(userId: string): Promise<string[]> {
        const follows = await Follow.findAll({
            where: {
                follower: userId
            }
        });
        return follows.map(follow => follow.following);
    }

    public async getFollowers(userId: string): Promise<string[]> {
        const follows = await Follow.findAll({
            where: {
                following: userId
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
