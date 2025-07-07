import { FollowRequestRepository } from "../repository/FollowRequestRepository";
import { FollowRequest, FollowRequestStatus } from "../database/database";
import { FollowRepository } from "../repository/FollowRepository";
import { UserRepository } from "../repository/UserRepository";

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
            throw new Error('Follow request already exists');
        }
        if (fromUserId === toUserId) {
            throw new Error('You cannot follow yourself');
        }
        const toUser = await this.userRepository.get(toUserId);
        if (toUser && toUser.settings.privacy === 'private') {
            throw new Error('You cannot follow a private user. Please send a follow request to the user.');
        }
        if (toUser && toUser.settings.privacy === 'public') {
            throw new Error('You can follow this user directly');
        }
        return await this.followRequestRepository.createFollowRequest(fromUserId, toUserId);
    }

    async approveFollowRequest(fromUserId: string, toUserId: string): Promise<FollowRequest> {
        console.log(`FollowRequestService.approveFollowRequest : from ${fromUserId} to ${toUserId}`);
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