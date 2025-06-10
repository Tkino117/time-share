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
    }
}