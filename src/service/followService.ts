import { UserRepository } from "../repository/userRepository";
import { FollowRepository } from "../repository/followRepository";
import { EventRepository } from "../repository/eventRepository";
import { UserNotFoundError, FollowAlreadyExistsError, FollowNotFoundError } from "./errors";
import { Event } from "../database/database";

export class FollowService {
    constructor(private readonly followRepository: FollowRepository,
        private readonly userRepository: UserRepository,
        private readonly eventRepository: EventRepository) {}

    public async followUser(followerId: string, followingId: string): Promise<void> {
        if (!await this.userRepository.exists(followerId)) {
            throw new UserNotFoundError(followerId);
        }
        if (!await this.userRepository.exists(followingId)) {
            throw new UserNotFoundError(followingId);
        }
        if (await this.followRepository.exists(followerId, followingId)) {
            throw new FollowAlreadyExistsError(followerId, followingId);
        }
        await this.followRepository.create({ follower: followerId, following: followingId });
    }

    public async unfollowUser(followerId: string, followingId: string): Promise<void> {
        if (!await this.userRepository.exists(followerId)) {
            throw new UserNotFoundError(followerId);
        }
        if (!await this.userRepository.exists(followingId)) {
            throw new UserNotFoundError(followingId);
        }
        if (!await this.followRepository.exists(followerId, followingId)) {
            throw new FollowNotFoundError(followerId, followingId);
        }
        await this.followRepository.delete(followerId, followingId);
    }

    public async getFollowings(userId: string): Promise<string[]> {
        if (!await this.userRepository.exists(userId)) {
            throw new UserNotFoundError(userId);
        }
        return await this.followRepository.getFollowings(userId);
    }

    public async getFollowers(userId: string): Promise<string[]> {
        if (!await this.userRepository.exists(userId)) {
            throw new UserNotFoundError(userId);
        }
        return await this.followRepository.getFollowers(userId);
    }

    public async getUserFeed(userId: string): Promise<Event[]> {
        if (!await this.userRepository.exists(userId)) {
            throw new UserNotFoundError(userId);
        }
        const followings = await this.followRepository.getFollowings(userId);
        const events: Event[] = [];
        for (const following of followings) {
            const followingEvents = await this.eventRepository.getByUserId(following);
            events.push(...followingEvents);
        }
        return events;
    }
}