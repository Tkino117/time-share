import { User, UserPrivacy } from "../database/database";
import { FollowRepository } from "../repository/FollowRepository";
import { FollowRequestRepository } from "../repository/FollowRequestRepository";

export enum FollowStatus {
    FOLLOWING = 'following',
    REQUESTING = 'requesting',
    NOT_FOLLOWING = 'not_following',
    UNDEFINED = 'undefined'
}

export class UserWithStats {
    public userId: string = "";
    public name: string = "";
    public profileImageUrl: string | undefined = undefined;
    public privacy: UserPrivacy = UserPrivacy.PUBLIC;
    public followingCount: number = 0;
    public followerCount: number = 0;
    public followingStatus: FollowStatus = FollowStatus.UNDEFINED;
    public followedByStatus: FollowStatus = FollowStatus.UNDEFINED;
    public user: User | null = null;
    public myUser: User | null = null;

    static async create(user: User, myUser: User | null, followRepository: FollowRepository, followRequestRepository: FollowRequestRepository): Promise<UserWithStats> {
        console.log(`UserWithStats.create: user=${user.userId}, myUser=${myUser?.userId}`);
        const res = new UserWithStats();
        res.user = user;
        res.myUser = myUser;
        res.userId = user.userId;
        res.name = user.name;
        res.profileImageUrl = user.profileImageUrl;
        res.privacy = user.settings.privacy;
        res.followingCount = await followRepository.getFollowingCount(user.userId);
        res.followerCount = await followRepository.getFollowerCount(user.userId);
        if (myUser) {
            res.followingStatus = await followRepository.exists(myUser.userId, user.userId) ? FollowStatus.FOLLOWING : FollowStatus.NOT_FOLLOWING;
            res.followedByStatus = await followRepository.exists(user.userId, myUser.userId) ? FollowStatus.FOLLOWING : FollowStatus.NOT_FOLLOWING;
            if (res.followingStatus === FollowStatus.NOT_FOLLOWING) {
                res.followingStatus = await followRequestRepository.exists(myUser.userId, user.userId) ? FollowStatus.REQUESTING : FollowStatus.NOT_FOLLOWING;
            }
            if (res.followedByStatus === FollowStatus.NOT_FOLLOWING) {
                res.followedByStatus = await followRequestRepository.exists(user.userId, myUser.userId) ? FollowStatus.REQUESTING : FollowStatus.NOT_FOLLOWING;
            }
        }
        return res;
    }

    public async updateStats(followRepository: FollowRepository, followRequestRepository: FollowRequestRepository) {
        console.log(`UserWithStats.updateStats: user=${this.userId}, myUser=${this.myUser?.userId}`);
        this.followingCount = await followRepository.getFollowingCount(this.userId);
        this.followerCount = await followRepository.getFollowerCount(this.userId);
        if (this.myUser) {
            this.followingStatus = await followRepository.exists(this.myUser.userId, this.userId) ? FollowStatus.FOLLOWING : FollowStatus.NOT_FOLLOWING;
            this.followedByStatus = await followRepository.exists(this.userId, this.myUser.userId) ? FollowStatus.FOLLOWING : FollowStatus.NOT_FOLLOWING;
        }
        console.log(`updated: ${this.toString()}`);
    }

    public toString(): string {
        return `UserWithStats: userId=${this.userId}, name=${this.name}, profileImageUrl=${this.profileImageUrl}, privacy=${this.privacy}, followingCount=${this.followingCount}, followerCount=${this.followerCount}, followingStatus=${this.followingStatus}, followedByStatus=${this.followedByStatus}`;
    }
}