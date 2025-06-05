import { Database, User, Follow, Event } from '../src/database/database';

describe('Database', () => {
    it('シングルトンインスタンスが正しく取得できること', () => {
        const instance1 = Database.getInstance();
        const instance2 = Database.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('ユーザーモデルが取得できること', () => {
        const db = Database.getInstance();
        expect(User).toBeDefined();
    });

    it('イベントモデルが取得できること', () => {
        const db = Database.getInstance();
        expect(Event).toBeDefined();
    });

    it('フォローモデルが取得できること', () => {
        const db = Database.getInstance();
        expect(Follow).toBeDefined();
    });

    describe('接続', () => {
        it('接続ができること', async () => {
            const db = Database.getInstance();
            await db.connect();
        });
    });
});
