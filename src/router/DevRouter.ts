import { AbstractRouter } from "./AbstractRouter";
import { UserService } from "../service";

export class DevRouter extends AbstractRouter {
    constructor(private userService: UserService) {
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
            res.json({ success: true, message: 'Demo users created' });
        });
    }
}