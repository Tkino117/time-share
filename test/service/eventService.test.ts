import { EventService } from "../../src/service/EventService";
import { EventRepository } from "../../src/repository/aEventRepository";
import { UserRepository } from "../../src/repository/aUserRepository";
import { SessionManager } from "../../src/repository/aSessionManager";
import { UserNotFoundError, InvalidTimeRangeError, TimeConflictError } from "../../src/service/errors";
import { Event } from "../../src/database/database";

jest.mock('../../src/repository/eventRepository');
jest.mock('../../src/repository/userRepository');
jest.mock('../../src/repository/sessionManager');

describe('EventService', () => {
    let eventService: EventService;
    let mockEventRepository: jest.Mocked<EventRepository>;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockSessionManager: jest.Mocked<SessionManager>;

    beforeEach(() => {
        mockEventRepository = jest.mocked(new EventRepository());
        mockUserRepository = jest.mocked(new UserRepository());
        mockSessionManager = jest.mocked(new SessionManager());

        eventService = new EventService(mockEventRepository, mockUserRepository, mockSessionManager);
        jest.clearAllMocks();
    });

    it('createEvent - user not found', async () => {
        mockUserRepository.exists.mockResolvedValue(false);
        try {
            await eventService.createEvent({
                userId: 'test-user-1',
                name: 'test-event-1',
                startTime: new Date(),
                endTime: new Date(new Date().getTime() + 1000)
            });
        } catch (error) {
            expect(error).toBeInstanceOf(UserNotFoundError);
        }
    });

    it('createEvent - invalid time range', async () => {
        mockUserRepository.exists.mockResolvedValue(true);
        try {
            await eventService.createEvent({
                userId: 'test-user-1',
                name: 'test-event-1',
                startTime: new Date(new Date().getTime() + 1000),
                endTime: new Date()
            });
        } catch (error) {
            expect(error).toBeInstanceOf(InvalidTimeRangeError);
        }
    });

    it('createEvent - time conflict', async () => {
        mockUserRepository.exists.mockResolvedValue(true);
        mockEventRepository.getByUserId.mockResolvedValue([new Event({
            eventId: 1,
            name: 'test-event-1',
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 1000),
            userId: 'test-user-1',
            isDone: false
        })]);
        try {
            await eventService.createEvent({
                userId: 'test-user-1',
                name: 'test-event-2',
                startTime: new Date(),
                endTime: new Date(new Date().getTime() + 1000)
            });
        } catch (error) {
            expect(error).toBeInstanceOf(TimeConflictError);
        }
    });
});