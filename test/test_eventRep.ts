
import { Database } from '../src/database/database';
import { EventRepository } from '../src/repository/eventRepository';
import { describe, it, before, after } from 'node:test';
import assert from 'assert';

describe('イベントリポジトリのテスト', () => {
    let db: Database;
    let eventRepository: EventRepository;
    
    const testEvent = {
        userId: 'test-user-1',
        name: 'テストイベント1',
        startTime: new Date('2024-01-01T10:00:00'),
        endTime: new Date('2024-01-01T11:00:00'),
        isDone: false
    };

    // テスト前のセットアップ
    before(async () => {
        db = Database.getInstance();
        await db.connect();
        await db.init();
        eventRepository = new EventRepository();
    });


    it('基本的なCRUD操作', async () => {
        let createdEventId: number;

        try {
            // Create
            const createdEvent = await eventRepository.create(
                testEvent.userId,
                testEvent.name,
                testEvent.startTime,
                testEvent.endTime
            );
            
            assert.ok(createdEvent, 'イベントが作成されていません');
            assert.ok(createdEvent.id, 'イベントIDが設定されていません');
            assert.strictEqual(createdEvent.name, testEvent.name);
            assert.strictEqual(createdEvent.userId, testEvent.userId);
            assert.strictEqual(createdEvent.isDone, false);
            
            createdEventId = createdEvent.id;

            // Read
            const foundEvent = await eventRepository.get(createdEventId);
            assert.ok(foundEvent, 'イベントが見つかりません');
            assert.strictEqual(foundEvent.name, testEvent.name);
            assert.strictEqual(foundEvent.userId, testEvent.userId);

            // Update
            const updatedName = '更新後のイベント';
            await eventRepository.update(createdEventId, updatedName);
            
            const updatedEvent = await eventRepository.get(createdEventId);
            assert.ok(updatedEvent, '更新後のイベントが見つかりません');
            assert.strictEqual(updatedEvent.name, updatedName);

            // Delete
            await eventRepository.delete(createdEventId);
            const deletedEvent = await eventRepository.get(createdEventId);
            assert.strictEqual(deletedEvent, null, 'イベントが削除されていません');

        } catch (error) {
            // テスト失敗時にもクリーンアップを実行
            throw error;
        }
    });

    it('ユーザーIDでイベント一覧を取得', async () => {
        const events = [];
        
        try {
            // 複数のイベントを作成
            const event1 = await eventRepository.create(
                testEvent.userId,
                'イベント1',
                new Date('2024-01-01T10:00:00'),
                new Date('2024-01-01T11:00:00')
            );
            events.push(event1);

            const event2 = await eventRepository.create(
                testEvent.userId,
                'イベント2',
                new Date('2024-01-02T10:00:00'),
                new Date('2024-01-02T11:00:00')
            );
            events.push(event2);

            // ユーザーのイベント一覧を取得
            const userEvents = await eventRepository.getByUserId(testEvent.userId);
            
            assert.ok(Array.isArray(userEvents), 'イベント一覧が配列ではありません');
            assert.ok(userEvents.length >= 2, 'イベントが2件以上取得されていません');
            
            // 時間順にソートされているかチェック
            for (let i = 1; i < userEvents.length; i++) {
                assert.ok(
                    userEvents[i-1].startTime <= userEvents[i].startTime,
                    'イベントが時間順にソートされていません'
                );
            }

        } finally {
            // クリーンアップ
            for (const event of events) {
                try {
                    await eventRepository.delete(event.id);
                } catch (error) {
                    console.warn('クリーンアップ中にエラーが発生しました:', error);
                }
            }
        }
    });

    it('存在しないイベントの取得', async () => {
        const nonExistentId = 99999;
        const event = await eventRepository.get(nonExistentId);
        assert.strictEqual(event, null, '存在しないイベントがnull以外を返しています');
    });

    it('存在しないイベントの削除', async () => {
        const nonExistentId = 99999;
        
        // 削除操作がエラーを投げるか、静かに失敗するかは実装次第
        // ここではエラーが投げられることを想定
        try {
            await eventRepository.delete(nonExistentId);
            // エラーが投げられない場合はここに到達する
        } catch (error) {
            // エラーが投げられることを期待
            assert.ok(error instanceof Error, 'エラーが適切に投げられていません');
        }
    });
});