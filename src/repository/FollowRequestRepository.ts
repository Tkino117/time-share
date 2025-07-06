import { FollowRequest } from "../database/database";

export class FollowRequestRepository {
    constructor(private followRequest: typeof FollowRequest) {}

    async createFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        return this.followRequest.create({ fromUserId, toUserId });
    }

    async getFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest | null> {
        return this.followRequest.findOne({ where: { fromUserId, toUserId } });
    }

    async getFollowRequestsByToUserId(toUserId: string): Promise<FollowRequest[]> {
        return this.followRequest.findAll({ where: { toUserId } });
    }

    async deleteFollowRequest(fromUserId: string, toUserId: string): Promise<void> {
        await this.followRequest.destroy({ where: { fromUserId, toUserId } });
    }
}