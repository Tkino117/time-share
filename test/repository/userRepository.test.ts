import { UserRepository } from "../../src/repository/userRepository";
import { Database } from "../../src/database/database";

describe('UserRepository', () => {
    let userRepository: UserRepository;
    let database: Database;

    beforeAll(async () => {
        database = Database.getInstance();
        await database.connect();
        await database.init();
        userRepository = new UserRepository();
    });

    afterAll(async () => {
        // テストデータのクリーンアップ
        await userRepository.delete('test-user-1');
        await userRepository.delete('test-user-2');
    });

    beforeEach(async () => {
        // 各テスト前にデータをクリーンアップ
        await userRepository.delete('test-user-1');
        await userRepository.delete('test-user-2');
    });

    it('ユーザーの作成と取得ができること', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        
        const createdUser = await userRepository.create(userId, password, name);
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

    it('ユーザーの削除ができること', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        
        await userRepository.create(userId, password, name);
        const deleted = await userRepository.delete(userId);
        expect(deleted).toBe(true);
        
        const user = await userRepository.get(userId);
        expect(user).toBeNull();
    });

    it('ユーザー情報の更新ができること', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        const newName = '更新されたユーザー';
        
        await userRepository.create(userId, password, name);
        const updated = await userRepository.update(userId, newName);
        expect(updated).toBeDefined();
        expect(updated?.name).toBe(newName);
        
        const user = await userRepository.get(userId);
        expect(user).toBeDefined();
        expect(user?.name).toBe(newName);
    });

    it('ユーザーの存在確認ができること', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        
        expect(await userRepository.exists(userId)).toBe(false);
        await userRepository.create(userId, password, name);
        expect(await userRepository.exists(userId)).toBe(true);
    });

    it('パスワードなしでユーザー情報を取得できること', async () => {
        const userId = 'test-user-1';
        const password = 'password123';
        const name = 'テストユーザー1';
        
        await userRepository.create(userId, password, name);
        const user = await userRepository.getWithoutPassword(userId);
        expect(user).toBeDefined();
        expect(user?.userId).toBe(userId);
        expect(user?.password).toBe('');
    });
});



    