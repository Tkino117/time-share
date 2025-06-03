import { Database } from '../src/database/database';
import { describe, it } from 'node:test';
import assert from 'assert';

describe('データベースのCRUDテスト - User', async () => {
    const db = Database.getInstance();
    await db.connect();
    await db.init();
    const User = db.getUserModel();

    const testUser = {
        userId: 'test-user-1',
        password: 'password123',
        name: 'テストユーザー1'
    };

    it('基本的なCRUD操作', async () => {
        // Create
        const createdUser = await User.create(testUser);
        assert.strictEqual(createdUser.userId, testUser.userId);

        // Read
        const foundUser = await User.findByPk(testUser.userId);
        assert.strictEqual(foundUser?.userId, testUser.userId);

        // Update
        await User.update({ name: '更新後の名前' }, {
            where: { userId: testUser.userId }
        });
        const updatedUser = await User.findByPk(testUser.userId);
        assert.strictEqual(updatedUser?.name, '更新後の名前');

        // Delete
        await User.destroy({
            where: { userId: testUser.userId }
        });
        const deletedUser = await User.findByPk(testUser.userId);
        assert.strictEqual(deletedUser, null);
    });
});

