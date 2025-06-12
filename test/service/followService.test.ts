import { FollowService } from "../../src/service/FollowService";
import { FollowRepository } from "../../src/repository/aFollowRepository";
import { UserRepository } from "../../src/repository/aUserRepository";
import { EventRepository } from "../../src/repository/aEventRepository";
import { FollowAlreadyExistsError, UserNotFoundError } from "../../src/service/errors";
import { Event } from "../../src/database/database";

jest.mock('../../src/repository/followRepository');
jest.mock('../../src/repository/userRepository');
jest.mock('../../src/repository/eventRepository');

describe('FollowService', () => {
    let followService: FollowService;
    let mockFollowRepository: jest.Mocked<FollowRepository>;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockEventRepository: jest.Mocked<EventRepository>;

    beforeEach(() => {
        mockFollowRepository = jest.mocked(new FollowRepository());
        mockUserRepository = jest.mocked(new UserRepository());
        mockEventRepository = jest.mocked(new EventRepository());

        followService = new FollowService(mockFollowRepository, mockUserRepository, mockEventRepository);
        jest.clearAllMocks();
    });

    it('followUser', async () => {
        mockUserRepository.exists.mockResolvedValue(true).mockResolvedValue(true);
        mockFollowRepository.exists.mockResolvedValue(false);
        await followService.followUser('test-user-1', 'test-user-2');
        expect(mockFollowRepository.create).toHaveBeenCalledWith({ follower: 'test-user-1', following: 'test-user-2' });
    });

    it('followUser - user not found', async () => {
        mockUserRepository.exists.mockResolvedValue(false);
        try {
            await followService.followUser('test-user-1', 'test-user-2');
            fail('Expected an error to be thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(UserNotFoundError);
        }
    });

    it('followUser - follow already exists', async () => {
        mockUserRepository.exists.mockResolvedValue(true).mockResolvedValue(true);
        mockFollowRepository.exists.mockResolvedValue(true);
        try {
            await followService.followUser('test-user-1', 'test-user-2');
            fail('Expected an error to be thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(FollowAlreadyExistsError);
        }
    });

    it('unfollowUser', async () => {
        mockUserRepository.exists.mockResolvedValue(true).mockResolvedValue(true);
        mockFollowRepository.exists.mockResolvedValue(true);
        await followService.unfollowUser('test-user-1', 'test-user-2');
        expect(mockFollowRepository.delete).toHaveBeenCalledWith('test-user-1', 'test-user-2');
    });

    // !note! テスト軽め
    it('getUserFeed', async () => {
        mockUserRepository.exists.mockResolvedValue(true).mockResolvedValue(true);
        mockFollowRepository.getFollowings.mockResolvedValue(['test-user-2']);
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 1000);
        mockEventRepository.getByUserId.mockResolvedValue([new Event({ id: 1, userId: 'test-user-2', name: 'test-event', startTime: startTime, endTime: endTime, isDone: false })]);
        const feed = await followService.getUserFeed('test-user-1');
        expect(feed).toEqual([new Event({ id: 1, userId: 'test-user-2', name: 'test-event', startTime: startTime, endTime: endTime, isDone: false })]);
    });
});
