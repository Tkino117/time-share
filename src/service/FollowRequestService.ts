import { FollowRequestRepository } from "../repository/FollowRequestRepository";
import { FollowRequest, FollowRequestStatus } from "../database/database";
import { FollowRepository } from "../repository/FollowRepository";

export class FollowRequestService {
    constructor(private followRequestRepository: FollowRequestRepository,
                private followRepository: FollowRepository
    ) {}

    async getFollowRequestsByToUserId(toUserId: string): Promise<FollowRequest[]> {
        const followRequests = await this.followRequestRepository.getFollowRequestsByToUserId(toUserId);
        return followRequests;
    }

    async createFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        const followRequest = await this.followRequestRepository.getFollowRequest(fromUserId, toUserId);
        if (followRequest) {
            throw new Error('Follow request already exists');
        }
        return this.followRequestRepository.createFollowRequest(fromUserId, toUserId);
    }

    async approveFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        const followRequest = await this.followRequestRepository.getFollowRequest(fromUserId, toUserId);
        if (!followRequest) {
            throw new Error('Follow request not found');
        }
        await this.followRequestRepository.deleteFollowRequest(fromUserId, toUserId);
        await this.followRepository.create({ follower: fromUserId, following: toUserId });
        return followRequest;
    }

    async rejectFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        const followRequest = await this.followRequestRepository.getFollowRequest(fromUserId, toUserId);
        if (!followRequest) {
            throw new Error('Follow request not found');
        }
        await this.followRequestRepository.deleteFollowRequest(fromUserId, toUserId);
        return followRequest;
    }
}