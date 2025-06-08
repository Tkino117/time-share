import { Database, User, Follow, Event } from '../../src/database/database';
import { UserRepository } from '../../src/repository/userRepository';

describe('Database', () => {
    let userRepository: UserRepository = new UserRepository();

    it('ユーザーを作成できること', async () => {
        try {
            const user1 = await userRepository.create({ userId: 'user1', password: 'password1', name: 'name1' });
            const user2 = await userRepository.create({ userId: 'user2', password: 'password2', name: 'name2' });
            expect(user1).toBeDefined();
            expect(user2).toBeDefined();

            const fetchedUser1 = await userRepository.get('user1');
            const fetchedUser2 = await userRepository.get('user2');
            expect(fetchedUser1?.userId).toBe(user1.userId);
            expect(fetchedUser1?.name).toBe(user1.name);
            expect(fetchedUser2?.userId).toBe(user2.userId);
            expect(fetchedUser2?.name).toBe(user2.name);

            const deleted = await userRepository.delete('user1');
            expect(deleted).toBe(true);
            const notFound = await userRepository.get('user1');
            expect(notFound).toBeNull();
            const updated = await userRepository.update('user2', { name: 'name2-updated' });
            expect(updated).toBeDefined();
            expect(updated?.name).toBe('name2-updated');
            const found = await userRepository.get('user2');
            expect(found).toBeDefined();
            expect(found?.name).toBe('name2-updated');
        } catch (error) {
            console.error('Error details:', error);
            throw error;
        }
    });
});

