import { EventRepository } from "../../src/repository/aEventRepository";
import { UserRepository } from "../../src/repository/aUserRepository";

describe('EventRepository', () => {
    const eventRepository = new EventRepository();
    const userRepository = new UserRepository();
    const userId = 'test-user-1';

    beforeAll(async () => {
        await userRepository.create({ userId, password: 'password', name: 'User 1' });
    });

    beforeEach(async () => {
        await eventRepository.clearAll();
    });

    afterAll(async () => {
        await eventRepository.clearAll();
    });

    it('create', async () => {
        const event = await eventRepository.create({ userId, name: 'Event 1', startTime: new Date(), endTime: new Date() });
        expect(event).toBeDefined();
        expect(event.userId).toBe(userId);
        expect(event.name).toBe('Event 1');
        expect(event.startTime).toBeDefined();
        expect(event.endTime).toBeDefined();
        expect(event.isDone).toBe(false);
    });

    it('delete', async () => {
        const event = await eventRepository.create({ userId, name: 'Event 1', startTime: new Date(), endTime: new Date() });
        await eventRepository.delete(event.id);
        const exists = await eventRepository.get(event.id);
        expect(exists).toBeNull();
    });

    it('update', async () => {
        const event = await eventRepository.create({ userId, name: 'Event 1', startTime: new Date(), endTime: new Date() });
        await eventRepository.update(event.id, { name: 'Event 2', isDone: true });
        const updatedEvent = await eventRepository.get(event.id);
        expect(updatedEvent).toBeDefined();
        expect(updatedEvent?.name).toBe('Event 2');
        expect(updatedEvent?.isDone).toBe(true);
    });

    it('get', async () => {
        const event = await eventRepository.create({ userId, name: 'Event 1', startTime: new Date(), endTime: new Date() });
        const retrievedEvent = await eventRepository.get(event.id);
        expect(retrievedEvent).toBeDefined();
        expect(retrievedEvent?.id).toBe(event.id);
        expect(retrievedEvent?.userId).toBe(userId);
    });

    it('getByUserId', async () => {
        const event1 = await eventRepository.create({ userId, name: 'Event 1', startTime: new Date(), endTime: new Date() });
        const event2 = await eventRepository.create({ userId, name: 'Event 2', startTime: new Date(), endTime: new Date() });
        const event3 = await eventRepository.create({ userId, name: 'Event 3', startTime: new Date(), endTime: new Date() });
        const events = await eventRepository.getByUserId(userId);
        expect(events).toHaveLength(3);
    });
});