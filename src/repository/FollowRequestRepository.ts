import { Database, FollowRequest } from "../database/database";

export class FollowRequestRepository {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    async createFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        return await FollowRequest.create({ fromUserId, toUserId });
    }

    async getFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest | null> {
        return await FollowRequest.findOne({ where: { fromUserId, toUserId } });
    }

    async getFollowRequestsByToUserId(toUserId: string): Promise<FollowRequest[]> {
        return await FollowRequest.findAll({ where: { toUserId } });
    }

    async deleteFollowRequest(fromUserId: string, toUserId: string): Promise<void> {
        await FollowRequest.destroy({ where: { fromUserId, toUserId } });
    }

    async exists(fromUserId: string, toUserId: string): Promise<boolean> {
        return (await FollowRequest.findOne({ where: { fromUserId, toUserId } })) !== null;
    }
}