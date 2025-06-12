import { FollowRepository } from "../../src/repository/aFollowRepository";
import { UserRepository } from "../../src/repository/aUserRepository";

describe('FollowRepository', () => {
    const followRepository = new FollowRepository();
    const userRepository = new UserRepository();
    const followerId = 'test-follower-1';
    const followingId = 'test-following-1';
    const followingId2 = 'test-following-2';
    const followingId3 = 'test-following-3';
    const followingId4 = 'test-following-4';

    beforeAll(async () => {
        // テストに必要なユーザーを作成
        await userRepository.create({ userId: followerId, password: 'password', name: 'Follower User' });
        await userRepository.create({ userId: followingId, password: 'password', name: 'following User 1' });
        await userRepository.create({ userId: followingId2, password: 'password', name: 'following User 2' });
        await userRepository.create({ userId: followingId3, password: 'password', name: 'following User 3' });
        await userRepository.create({ userId: followingId4, password: 'password', name: 'following User 4' });
    });

    beforeEach(async () => {
        // 存在する可能性のあるフォロー関係を削除
        const followings = await followRepository.getFollowings(followerId);
        for (const following of followings) {
            await followRepository.delete(followerId, following);
        }
    });

    
    it('create', async () => {
        await followRepository.create({ follower: followerId, following: followingId });
        const exists = await followRepository.exists(followerId, followingId);
        expect(exists).toBe(true);
    });

    it('delete', async () => {
        await followRepository.create({ follower: followerId, following: followingId });
        await followRepository.delete(followerId, followingId);
        const exists = await followRepository.exists(followerId, followingId);
        expect(exists).toBe(false);
    });

    it('getfollowings', async () => {
        await followRepository.create({ follower: followerId, following: followingId });
        await followRepository.create({ follower: followerId, following: followingId2 });
        await followRepository.create({ follower: followerId, following: followingId3 });
        const followings = await followRepository.getFollowings(followerId);
        expect(followings).toHaveLength(3);
        expect(followings).toEqual(expect.arrayContaining([followingId, followingId2, followingId3]));
    });

    it('getFollowers', async () => {
        await followRepository.create({ follower: followerId, following: followingId });
        await followRepository.create({ follower: followerId, following: followingId2 });
        await followRepository.create({ follower: followerId, following: followingId3 });
        const followers = await followRepository.getFollowers(followingId);
        expect(followers).toHaveLength(1);
        expect(followers).toEqual(expect.arrayContaining([followerId]));
    });

    it('exists', async () => {
        await followRepository.create({ follower: followerId, following: followingId });
        const exists = await followRepository.exists(followerId, followingId);
        expect(exists).toBe(true);
        const notExists = await followRepository.exists(followerId, followingId2);
        expect(notExists).toBe(false);
    });
});


