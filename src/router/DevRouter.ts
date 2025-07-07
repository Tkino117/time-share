import { AbstractRouter } from "./AbstractRouter";
import { EventService, FollowService, NotificationService, UserService } from "../service";
import { EventType, UserPrivacy } from "../database/database";
import { NotificationCreateInput } from "../repository/NotificationRepository";
import { NotificationType } from "../database/database";
import { handleError } from "../controller/util"

export class DevRouter extends AbstractRouter {
    constructor(private userService: UserService, private eventService: EventService, private followService: FollowService, private notificationService: NotificationService) {
        super();
        this.initialize();
    }

    initializeRoutes(): void {
        // !note! 本番環境で隠す
        this.router.get('/users', async (req, res) => {
            try {
                const users = await this.userService.findAll();
                const usersData = users.map(user => {
                    const { userId, password, name } = user.toJSON();
                    return { userId, password, name };
                });
                res.json(usersData);
            } catch (error) {
                handleError(error, res);
            }
        });
        this.router.post('/demo-dev', async (req, res) => {
            try {
                const demo = await this.userService.createUser({ userId: 'a', password: 'a', name: 'a' });
                const demo2 = await this.userService.createUser({ userId: 'b', password: 'b', name: 'cocos' });
                const demo3 = await this.userService.createUser({ userId: 'c', password: 'c', name: 'ボ' });
                const demo4 = await this.userService.createUser({ userId: 'd', password: 'd', name: '鍵垢くん', settings: { privacy: UserPrivacy.PROTECTED } });
                const demo5 = await this.userService.createUser({ userId: 'e', password: 'e', name: '非公開くん', settings: { privacy: UserPrivacy.PRIVATE } });
                await this.followService.followUser(demo.userId, demo2.userId);
                await this.followService.followUser(demo.userId, demo3.userId);
                await this.followService.followUser(demo2.userId, demo3.userId);
                await this.followService.followUser(demo3.userId, demo.userId);
                await this.followService.followUser(demo4.userId, demo.userId);
                
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                const beforeYesterday = new Date();
                beforeYesterday.setDate(beforeYesterday.getDate() - 2);
                beforeYesterday.setHours(0, 0, 0, 0);

                
                // おとといのイベント
                const event2 = await this.eventService.createEvent(
                    { userId: demo2.userId, name: '朝の運動', startTime: new Date(beforeYesterday.getTime() + 6 * 60 * 60 * 1000), endTime: new Date(beforeYesterday.getTime() + 7 * 60 * 60 * 1000), type: EventType.EXERCISE });
                const event3 = await this.eventService.createEvent(
                    { userId: demo3.userId, name: '午後の仕事', startTime: new Date(beforeYesterday.getTime() + 13 * 60 * 60 * 1000), endTime: new Date(beforeYesterday.getTime() + 17 * 60 * 60 * 1000), type: EventType.WORK });

                // 昨日のイベント
                const event4 = await this.eventService.createEvent(
                    { userId: demo.userId, name: '朝食', startTime: new Date(yesterday.getTime() + 7 * 60 * 60 * 1000), endTime: new Date(yesterday.getTime() + 8 * 60 * 60 * 1000), type: EventType.MEAL, isPublic: false });
                const event5 = await this.eventService.createEvent(
                    { userId: demo2.userId, name: '昼寝', startTime: new Date(yesterday.getTime() + 12 * 60 * 60 * 1000), endTime: new Date(yesterday.getTime() + 13 * 60 * 60 * 1000), type: EventType.SLEEP });
                const event6 = await this.eventService.createEvent(
                    { userId: demo3.userId, name: '夕方の勉強', startTime: new Date(yesterday.getTime() + 16 * 60 * 60 * 1000), endTime: new Date(yesterday.getTime() + 18 * 60 * 60 * 1000), type: EventType.STUDY });

                // 今日のイベント
                const event7 = await this.eventService.createEvent(
                    { userId: demo.userId, name: '昼食', startTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), endTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), type: EventType.MEAL });
                const event8 = await this.eventService.createEvent(
                    { userId: demo2.userId, name: '午後の会議', startTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), endTime: new Date(today.getTime() + 15 * 60 * 60 * 1000), type: EventType.WORK, isPublic: false });
                const event10 = await this.eventService.createEvent(
                    { userId: demo4.userId, name: '昼食', startTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), endTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), type: EventType.MEAL });
                const event11 = await this.eventService.createEvent(
                    { userId: demo5.userId, name: '昼食', startTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), endTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), type: EventType.MEAL });

                // 明日のイベント
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const event9 = await this.eventService.createEvent(
                    { userId: demo3.userId, name: '朝の勉強会', startTime: new Date(tomorrow.getTime() + 9 * 60 * 60 * 1000), endTime: new Date(tomorrow.getTime() + 11 * 60 * 60 * 1000), type: EventType.STUDY, isPublic: false });

                // 睡眠イベントの追加（全員おとといから昨日）
                const sleep1 = await this.eventService.createEvent(
                    { userId: demo.userId, name: '睡眠', startTime: new Date(beforeYesterday.getTime() + 23 * 60 * 60 * 1000), endTime: new Date(yesterday.getTime() + 7 * 60 * 60 * 1000), type: EventType.SLEEP });
                
                const sleep2 = await this.eventService.createEvent(
                    { userId: demo2.userId, name: '睡眠', startTime: new Date(beforeYesterday.getTime() + 22 * 60 * 60 * 1000), endTime: new Date(yesterday.getTime() + 6 * 60 * 60 * 1000), type: EventType.SLEEP });
                
                const sleep3 = await this.eventService.createEvent(
                    { userId: demo3.userId, name: '睡眠', startTime: new Date(beforeYesterday.getTime() + 23 * 60 * 60 * 1000 + 30 * 60 * 1000), endTime: new Date(yesterday.getTime() + 7 * 60 * 60 * 1000 + 30 * 60 * 1000), type: EventType.SLEEP });

                res.json({ success: true, message: 'Demo users created' });
            } catch (error) {
                handleError(error, res);
            }
        });
        this.router.post('/notify/:userId', async (req, res) => {
            try {
                const userId = req.params.userId;
                const title = req.body.title;
                const message = req.body.message;
                const notification: NotificationCreateInput = {
                    userId: userId,
                    type: NotificationType.OTHER,
                    title: title,
                    message: message,
                }
                await this.notificationService.createNotification(notification);
                res.json({ success: true, message: 'Notification created' });
            } catch (error) {
                handleError(error, res);
            }
        });
    }
}