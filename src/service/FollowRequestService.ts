import { FollowRequestRepository } from "../repository/FollowRequestRepository";
import { FollowRequest, FollowRequestStatus, UserPrivacy } from "../database/database";
import { FollowRepository } from "../repository/FollowRepository";
import { UserRepository } from "../repository/UserRepository";
import { FollowRequestAlreadyExistsError, FollowRequestNotFoundError, FollowRequestNotRequiredError } from "./errors/FollowRequestError";
import { FollowAlreadyExistsError, FollowSelfError } from "./errors/FollowError";
import { FollowPermissionError } from "./errors/FollowError";
import { UserNotFoundError } from "./errors/UserError";

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
        if (!toUser) {
            throw new UserNotFoundError(toUserId);
        }
        if (await this.followRepository.exists(fromUserId, toUserId)) {
            throw new FollowAlreadyExistsError(fromUserId, toUserId);
        }
        if (toUser.settings.privacy === UserPrivacy.PRIVATE) {
            throw new FollowPermissionError(fromUserId, toUserId);
        }
        if (toUser.settings.privacy === UserPrivacy.PUBLIC) {
            throw new FollowRequestNotRequiredError(fromUserId, toUserId);
        }
        return await this.followRequestRepository.createFollowRequest(fromUserId, toUserId);
    }

    async deleteFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        const followRequest = await this.followRequestRepository.getFollowRequest(fromUserId, toUserId);
        if (!followRequest) {
            throw new FollowRequestNotFoundError(fromUserId, toUserId);
        }
        await this.followRequestRepository.deleteFollowRequest(fromUserId, toUserId);
        return followRequest;
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