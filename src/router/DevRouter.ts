import { AbstractRouter } from "./AbstractRouter";
import { EventService, FollowService, UserService } from "../service";

export class DevRouter extends AbstractRouter {
    constructor(private userService: UserService, private eventService: EventService, private followService: FollowService) {
        super();
        this.initialize();
    }

    initializeRoutes(): void {
        // !note! 本番環境で隠す
        this.router.get('/users', async (req, res) => {
            const users = await this.userService.findAll();
            const usersData = users.map(user => {
                const { userId, password, name } = user.toJSON();
                return { userId, password, name };
            });
            res.json(usersData);
        });
        this.router.post('/demo-dev', async (req, res) => {
            const demo = await this.userService.createUser({ userId: 'a', password: 'a', name: 'a' });
            const demo2 = await this.userService.createUser({ userId: 'b', password: 'b', name: 'b' });
            const demo3 = await this.userService.createUser({ userId: 'c', password: 'c', name: 'c' });
            await this.followService.followUser(demo.userId, demo2.userId);
            await this.followService.followUser(demo.userId, demo3.userId);
            await this.followService.followUser(demo2.userId, demo3.userId);
            await this.followService.followUser(demo3.userId, demo.userId);
            
            const event1 = await this.eventService.createEvent(
                { userId: demo.userId, name: 'event1', startTime: new Date(), endTime: new Date(Date.now() + 10 * 60 * 1000) });
            const event2 = await this.eventService.createEvent(
                { userId: demo.userId, name: 'event2', startTime: new Date(Date.now() + 11 * 60 * 1000), endTime: new Date(Date.now() + 20 * 60 * 1000) });
            const event3 = await this.eventService.createEvent(
                { userId: demo2.userId, name: 'event3', startTime: new Date(Date.now()), endTime: new Date(Date.now() + 30 * 60 * 1000) });
            const event4 = await this.eventService.createEvent(
                { userId: demo3.userId, name: 'event4', startTime: new Date(Date.now() + 30 * 60 * 1000), endTime: new Date(Date.now() + 40 * 60 * 1000) });
            const event5 = await this.eventService.createEvent(
                { userId: demo3.userId, name: 'event5', startTime: new Date(Date.now() + 45 * 60 * 1000), endTime: new Date(Date.now() + 50 * 60 * 1000) });

            res.json({ success: true, message: 'Demo users created' });
        });
    }
}