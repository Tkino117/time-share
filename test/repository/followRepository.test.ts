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
        await userRepository.create(followerId, 'password', 'Follower User');
        await userRepository.create(followeeId, 'password', 'Followee User 1');
        await userRepository.create(followeeId2, 'password', 'Followee User 2');
        await userRepository.create(followeeId3, 'password', 'Followee User 3');
        await userRepository.create(followeeId4, 'password', 'Followee User 4');
    });

    beforeEach(async () => {
        // 存在する可能性のあるフォロー関係を削除
        const followees = await followRepository.getFollowees(followerId);
        for (const followee of followees) {
            await followRepository.delete(followee, followerId);
        }
    });

    
    it('create', async () => {
        await followRepository.create(followeeId, followerId);
        const exists = await followRepository.exists(followeeId, followerId);
        expect(exists).toBe(true);
    });

    it('delete', async () => {
        await followRepository.create(followeeId, followerId);
        await followRepository.delete(followeeId, followerId);
        const exists = await followRepository.exists(followeeId, followerId);
        expect(exists).toBe(false);
    });

    it('getFollowees', async () => {
        await followRepository.create(followeeId, followerId);
        await followRepository.create(followeeId2, followerId);
        await followRepository.create(followeeId3, followerId);
        const followees = await followRepository.getFollowees(followerId);
        expect(followees).toHaveLength(3);
        expect(followees).toEqual(expect.arrayContaining([followeeId, followeeId2, followeeId3]));
    });

    it('getFollowers', async () => {
        await followRepository.create(followeeId, followerId);
        await followRepository.create(followeeId2, followerId);
        await followRepository.create(followeeId3, followerId);
        const followers = await followRepository.getFollowers(followeeId);
        expect(followers).toHaveLength(1);
        expect(followers).toEqual(expect.arrayContaining([followerId]));
    });

    it('exists', async () => {
        await followRepository.create(followeeId, followerId);
        const exists = await followRepository.exists(followeeId, followerId);
        expect(exists).toBe(true);
        const notExists = await followRepository.exists(followeeId2, followerId);
        expect(notExists).toBe(false);
    });
});


