import { AbstractRouter } from "./AbstractRouter";
import { UserRouter } from "./UserRouter";
import { AuthRouter } from "./AuthRouter";
import { EventRouter } from "./EventRouter";
import { DevRouter } from "./DevRouter";
import { RankingRouter } from "./RankingRouter";
import { Request, Response } from 'express';
import { EmptyResponseData, SuccessResponse } from '../response';
import { NotificationRouter } from "./NotificationRouter";
import { SettingRouter } from "./SettingRouter";
export * from './UserRouter';
export * from './AuthRouter';
export * from './EventRouter';
export * from './DevRouter';
export * from './RankingRouter';
export * from './NotificationRouter';
export * from './SettingRouter';

export class Router extends AbstractRouter {
    constructor(private readonly userRouter: UserRouter,
        private readonly authRouter: AuthRouter,
        private readonly eventRouter: EventRouter,
        private readonly devRouter: DevRouter,
        private readonly rankingRouter: RankingRouter,
        private readonly notificationRouter: NotificationRouter,
        private readonly settingRouter: SettingRouter) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        this.router.use('/api/users', this.userRouter.getRouter());
        this.router.use('/api/auth', this.authRouter.getRouter());
        this.router.use('/api/events', this.eventRouter.getRouter());
        this.router.use('/api/dev', this.devRouter.getRouter());
        this.router.use('/api/rankings', this.rankingRouter.getRouter());
        this.router.use('/api/notifications', this.notificationRouter.getRouter());
        this.router.use('/api/settings', this.settingRouter.getRouter());
        this.router.get('/api/sample', async (req: Request, res: Response) => {
            new SuccessResponse(new EmptyResponseData(), 'Sample API').send(res);
        });
    }
}