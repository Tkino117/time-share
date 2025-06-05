import { EventRepository } from "../../src/repository/eventRepository";
import { UserRepository } from "../../src/repository/userRepository";

describe('EventRepository', () => {
    const eventRepository = new EventRepository();
    const userRepository = new UserRepository();
    const userId = 'test-user-1';

    beforeAll(async () => {
        await userRepository.create(userId, 'password', 'User 1');
    });

    beforeEach(async () => {
        const events = await eventRepository.getByUserId(userId);
        for (const event of events) {
            await eventRepository.delete(event.id);
        }
    });

    it('create', async () => {
        const event = await eventRepository.create(userId, 'Event 1', new Date(), new Date());
        expect(event).toBeDefined();
        expect(event.userId).toBe(userId);
        expect(event.name).toBe('Event 1');
        expect(event.startTime).toBeDefined();
        expect(event.endTime).toBeDefined();
        expect(event.isDone).toBe(false);
    });

    it('delete', async () => {
        const event = await eventRepository.create(userId, 'Event 1', new Date(), new Date());
        await eventRepository.delete(event.id);
        const exists = await eventRepository.get(event.id);
        expect(exists).toBeNull();
    });

    it('update', async () => {
        const event = await eventRepository.create(userId, 'Event 1', new Date(), new Date());
        await eventRepository.update(event.id, 'Event 2', new Date(), new Date(), true);
        const updatedEvent = await eventRepository.get(event.id);
        expect(updatedEvent).toBeDefined();
        expect(updatedEvent?.name).toBe('Event 2');
        expect(updatedEvent?.isDone).toBe(true);
    });

    it('get', async () => {
        const event = await eventRepository.create(userId, 'Event 1', new Date(), new Date());
        const retrievedEvent = await eventRepository.get(event.id);
        expect(retrievedEvent).toBeDefined();
        expect(retrievedEvent?.id).toBe(event.id);
        expect(retrievedEvent?.userId).toBe(userId);
    });

    it('getByUserId', async () => {
        const event1 = await eventRepository.create(userId, 'Event 1', new Date(), new Date());
        const event2 = await eventRepository.create(userId, 'Event 2', new Date(), new Date());
        const event3 = await eventRepository.create(userId, 'Event 3', new Date(), new Date());
        const events = await eventRepository.getByUserId(userId);
        expect(events).toHaveLength(3);
    });
});