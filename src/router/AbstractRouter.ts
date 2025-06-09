import { Router } from 'express';

export abstract class AbstractRouter {
    protected router: Router;

    protected constructor() {
        this.router = Router();
    }

    public initialize(): void {
        this.initializeRoutes();
    }

    protected abstract initializeRoutes(): void;

    public getRouter(): Router {
        return this.router;
    }
}