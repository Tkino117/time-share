import { AbstractRouter } from "./AbstractRouter";
import { UserRouter } from "./userRouter";
import { AuthRouter } from "./authRouter";
import { EventRouter } from "./eventRouter";
import { DevRouter } from "./DevRouter";
import { Request, Response } from 'express';
import { EmptyResponseData, SuccessResponse } from '../response';
export * from './userRouter';
export * from './authRouter';
export * from './eventRouter';
export * from './DevRouter';

export class Router extends AbstractRouter {
    constructor(private readonly userRouter: UserRouter,
        private readonly authRouter: AuthRouter,
        private readonly eventRouter: EventRouter,
        private readonly devRouter: DevRouter) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        this.router.use('/api/users', this.userRouter.getRouter());
        this.router.use('/api/auth', this.authRouter.getRouter());
        this.router.use('/api/events', this.eventRouter.getRouter());
        this.router.use('/api/dev', this.devRouter.getRouter());
        this.router.get('/api/sample', async (req: Request, res: Response) => {
            new SuccessResponse(new EmptyResponseData(), 'Sample API').send(res);
        });
    }
}