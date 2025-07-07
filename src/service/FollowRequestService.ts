import { FollowRequestRepository } from "../repository/FollowRequestRepository";
import { FollowRequest, FollowRequestStatus } from "../database/database";
import { FollowRepository } from "../repository/FollowRepository";
import { UserRepository } from "../repository/UserRepository";
import { FollowRequestAlreadyExistsError, FollowRequestNotFoundError } from "./errors/FollowRequestError";
import { FollowSelfError } from "./errors/FollowError";
import { FollowPermissionError } from "./errors/FollowError";

export class FollowRequestService {
    constructor(private followRequestRepository: FollowRequestRepository,
                private userRepository: UserRepository,
                private followRepository: FollowRepository
    ) {}

    async getFollowRequestsByToUserId(toUserId: string): Promise<FollowRequest[]> {
        const followRequests = await this.followRequestRepository.getFollowRequestsByToUserId(toUserId);
        return followRequests;
    }

    async createFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        const followRequest = await this.followRequestRepository.getFollowRequest(fromUserId, toUserId);
        if (followRequest) {
            throw new FollowRequestAlreadyExistsError(fromUserId, toUserId);
        }
        if (fromUserId === toUserId) {
            throw new FollowSelfError(fromUserId);
        }
        const toUser = await this.userRepository.get(toUserId);
        if (toUser && toUser.settings.privacy === 'private') {
            throw new FollowPermissionError(fromUserId, toUserId);
        }
        if (toUser && toUser.settings.privacy === 'public') {
            throw new FollowPermissionError(fromUserId, toUserId);
        }
        return await this.followRequestRepository.createFollowRequest(fromUserId, toUserId);
    }

    async approveFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        console.log(`FollowRequestService.approveFollowRequest : from ${fromUserId} to ${toUserId}`);
        const followRequest = await this.followRequestRepository.getFollowRequest(fromUserId, toUserId);
        if (!followRequest) {
            throw new FollowRequestNotFoundError(fromUserId, toUserId);
        }
        await this.followRequestRepository.deleteFollowRequest(fromUserId, toUserId);
        await this.followRepository.create({ follower: fromUserId, following: toUserId });
        return followRequest;
    }

    async rejectFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        const followRequest = await this.followRequestRepository.getFollowRequest(fromUserId, toUserId);
        if (!followRequest) {
            throw new FollowRequestNotFoundError(fromUserId, toUserId);
        }
        await this.followRequestRepository.deleteFollowRequest(fromUserId, toUserId);
        return followRequest;
    }
}