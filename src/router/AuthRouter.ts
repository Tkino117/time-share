import { AbstractRouter } from "./AbstractRouter";
import { AuthController } from "../controller/AuthController";

export class AuthRouter extends AbstractRouter {
    constructor(private authController: AuthController) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        this.router.post('/login', (req, res) => this.authController.login(req, res));
        this.router.post('/logout', (req, res) => this.authController.logout(req, res));
    }
}