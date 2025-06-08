import { UserRepository } from "../../src/repository/userRepository";

describe('UserRepository', () => {
    const userRepository = new UserRepository();

    beforeAll(async () => {
        await userRepository.clearAll();
    });

    afterAll(async () => {
        await userRepository.clearAll();
    });

    beforeEach(async () => {
        await userRepository.clearAll();
    });

    it('create', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        
        const createdUser = await userRepository.create({ userId, password, name });
        expect(createdUser).toBeDefined();
        expect(createdUser.userId).toBe(userId);
        expect(createdUser.password).toBe(password);
        expect(createdUser.name).toBe(name);

        const fetchedUser = await userRepository.get(userId);
        expect(fetchedUser).toBeDefined();
        expect(fetchedUser?.userId).toBe(userId);
        expect(fetchedUser?.password).toBe(password);
        expect(fetchedUser?.name).toBe(name);
    });

    it('delete', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        
        await userRepository.create({ userId, password, name });
        const deleted = await userRepository.delete(userId);
        expect(deleted).toBe(true);
        
        const user = await userRepository.get(userId);
        expect(user).toBeNull();
    });

    it('update', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        const newName = '更新されたユーザー';
        
        await userRepository.create({ userId, password, name });
        const updated = await userRepository.update(userId, { name: newName });
        expect(updated).toBeDefined();
        expect(updated?.name).toBe(newName);
        
        const user = await userRepository.get(userId);
        expect(user).toBeDefined();
        expect(user?.name).toBe(newName);
    });

    it('exists', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        
        expect(await userRepository.exists(userId)).toBe(false);
        await userRepository.create({ userId, password, name });
        expect(await userRepository.exists(userId)).toBe(true);
    });

    it('getWithoutPassword', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        
        await userRepository.create({ userId, password, name });
        const user = await userRepository.getWithoutPassword(userId);
        expect(user).toBeDefined();
        expect(user?.userId).toBe(userId);
        expect(user?.password).toBe('');
    });
});



    