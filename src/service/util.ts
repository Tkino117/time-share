import { User, UserPrivacy } from "../database/database";
import { FollowRepository } from "../repository/FollowRepository";

export class UserWithStats {
    public userId: string;
    public name: string;
    public followingCount: number = 0;
    public followerCount: number = 0;
    public privacy: UserPrivacy;
    
    constructor(user: User, followRepository: FollowRepository) {
        this.userId = user.userId;
        this.name = user.name;
        this.privacy = user.settings.privacy;
        this.init(user, followRepository);
    }

    private async init(user: User, followRepository: FollowRepository) {
        this.followingCount = await followRepository.getFollowingCount(user.userId);
        this.followerCount = await followRepository.getFollowerCount(user.userId);
    }
}

export async function userToUserWithStats(user: User, followRepository: FollowRepository): Promise<UserWithStats> {
    return new UserWithStats(user, followRepository);
}