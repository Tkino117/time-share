import { UserService } from "../../src/service/UserService";
import { UserRepository } from "../../src/repository/aUserRepository";
import { SessionManager } from "../../src/repository/aSessionManager";
import { User } from "../../src/database/database";
import { UserNotFoundError, InvalidPasswordError } from "../../src/service/errors";

jest.mock('../../src/repository/userRepository');
jest.mock('../../src/repository/sessionManager');

describe('UserService', () => {
    let userService: UserService;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockSessionManager: jest.Mocked<SessionManager>;
    
    beforeEach(() => {
        mockUserRepository = jest.mocked(new UserRepository());
        mockSessionManager = jest.mocked(new SessionManager());
        
        userService = new UserService(mockUserRepository, mockSessionManager);
        jest.clearAllMocks();
    });
    
    it('login', async () => {
        mockUserRepository.get.mockResolvedValue(new User({
            userId: 'test-user-1',
            password: 'password123',
            name: 'テストユーザー1'
        }));

        mockSessionManager.createSession.mockReturnValue({
            sessionId: 'test-session-id',
            userId: 'test-user-1',
            startTime: new Date(),
            endTime: new Date()
        });
        
        const result = await userService.login('test-user-1', 'password123');
        expect(result).toEqual('test-session-id');

    });

    it('login-user-not-found', async () => {
        mockUserRepository.get.mockResolvedValue(null);
        try {
            await userService.login('test-user-1', 'password123');
        } catch (error) {
            expect(error).toBeInstanceOf(UserNotFoundError);
        }
    });

    it('login-invalid-password', async () => {
        mockUserRepository.get.mockResolvedValue(new User({
            userId: 'test-user-1',
            password: 'password123',
            name: 'テストユーザー1'
        }));
        try {
            await userService.login('test-user-1', 'password456');
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidPasswordError);
        }
    });
});