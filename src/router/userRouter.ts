import { AbstractRouter } from "./AbstractRouter";

export class UserRouter extends AbstractRouter {
    constructor() {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        // this.router.post('/register', this.register);
    }
}