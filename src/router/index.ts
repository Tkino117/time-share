import { AbstractRouter } from "./AbstractRouter";
import { UserRouter } from "./UserRouter";
import { AuthRouter } from "./AuthRouter";
import { EventRouter } from "./EventRouter";
import { DevRouter } from "./DevRouter";
import { Request, Response } from 'express';
import { EmptyResponseData, SuccessResponse } from '../response';
export * from './UserRouter';
export * from './AuthRouter';
export * from './EventRouter';
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