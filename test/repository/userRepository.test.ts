import { UserRepository } from "../../src/repository/userRepository";
import { describe, it } from 'node:test';

describe('userRepository', () => {
    const userRepository = new UserRepository();

    it('create', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        await userRepository.create(userId, password, name);
        const user = await userRepository.get(userId);
        expect(user).toBeDefined();
        expect(user?.userId).toBe(userId);
        expect(user?.password).toBe(password);
        expect(user?.name).toBe(name);
    });
});