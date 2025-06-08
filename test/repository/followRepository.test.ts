import { FollowRepository } from "../../src/repository/followRepository";
import { UserRepository } from "../../src/repository/userRepository";

describe('FollowRepository', () => {
    const followRepository = new FollowRepository();
    const userRepository = new UserRepository();
    const followerId = 'test-follower-1';
    const followeeId = 'test-followee-1';
    const followeeId2 = 'test-followee-2';
    const followeeId3 = 'test-followee-3';
    const followeeId4 = 'test-followee-4';

    beforeAll(async () => {
        // テストに必要なユーザーを作成
        await userRepository.create({ userId: followerId, password: 'password', name: 'Follower User' });
        await userRepository.create({ userId: followeeId, password: 'password', name: 'Followee User 1' });
        await userRepository.create({ userId: followeeId2, password: 'password', name: 'Followee User 2' });
        await userRepository.create({ userId: followeeId3, password: 'password', name: 'Followee User 3' });
        await userRepository.create({ userId: followeeId4, password: 'password', name: 'Followee User 4' });
    });

    beforeEach(async () => {
        // 存在する可能性のあるフォロー関係を削除
        const followees = await followRepository.getFollowees(followerId);
        for (const followee of followees) {
            await followRepository.delete(followee, followerId);
        }
    });

    
    it('create', async () => {
        await followRepository.create({ followee: followeeId, follower: followerId });
        const exists = await followRepository.exists(followeeId, followerId);
        expect(exists).toBe(true);
    });

    it('delete', async () => {
        await followRepository.create({ followee: followeeId, follower: followerId });
        await followRepository.delete(followeeId, followerId);
        const exists = await followRepository.exists(followeeId, followerId);
        expect(exists).toBe(false);
    });

    it('getFollowees', async () => {
        await followRepository.create({ followee: followeeId, follower: followerId });
        await followRepository.create({ followee: followeeId2, follower: followerId });
        await followRepository.create({ followee: followeeId3, follower: followerId });
        const followees = await followRepository.getFollowees(followerId);
        expect(followees).toHaveLength(3);
        expect(followees).toEqual(expect.arrayContaining([followeeId, followeeId2, followeeId3]));
    });

    it('getFollowers', async () => {
        await followRepository.create({ followee: followeeId, follower: followerId });
        await followRepository.create({ followee: followeeId2, follower: followerId });
        await followRepository.create({ followee: followeeId3, follower: followerId });
        const followers = await followRepository.getFollowers(followeeId);
        expect(followers).toHaveLength(1);
        expect(followers).toEqual(expect.arrayContaining([followerId]));
    });

    it('exists', async () => {
        await followRepository.create({ followee: followeeId, follower: followerId });
        const exists = await followRepository.exists(followeeId, followerId);
        expect(exists).toBe(true);
        const notExists = await followRepository.exists(followeeId2, followerId);
        expect(notExists).toBe(false);
    });
});


