import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { Router, UserRouter, AuthRouter, EventRouter, DevRouter, RankingRouter, SettingRouter, NotificationRouter } from './router';
import { AuthController, UserController, EventController, RankingController, SettingController, NotificationController } from './controller';
import { UserService, EventService, FollowService, RankingService, NotificationService } from './service';
import { SessionManager, UserRepository, EventRepository, FollowRepository, NotificationRepository } from './repository';
import { Database } from './database/database';

// セッションの型定義
declare module 'express-session' {
    interface SessionData {
        sessionId: string;
    }
}

async function initExpress(app: express.Express) {
    // 静的ファイルの配信設定
    app.use(express.static(path.join(__dirname, '../public')));

    // CORS の設定（!note!本番環境で見直すこと）
    app.use(cors({
        origin: true,
        credentials: true
    }));

    // json のパース
    app.use(express.json());

    // cookie の設定。デフォルトの session を利用する
    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true
    }));

    // ログ出力
    app.use(async (req: Request, res: Response, next: NextFunction) => {
        console.log(`${req.method} ${req.path}`);
        console.log(`body: ${JSON.stringify(req.body)}`);
        next();
    });

    return app;
}

const port = 3500;
async function main() {
    try {
        // データベースの初期化
        const database = Database.getInstance();
        await database.connect();
        await database.init();

        // 依存性注入
        const userRepository = new UserRepository();
        const eventRepository = new EventRepository();
        const followRepository = new FollowRepository();
        const notificationRepository = new NotificationRepository();
        const sessionManager = new SessionManager();
        const followService = new FollowService(followRepository, userRepository, eventRepository);
        const userService = new UserService(userRepository, sessionManager, followService);
        const eventService = new EventService(eventRepository, userRepository, sessionManager);
        const rankingService = new RankingService(eventRepository, userRepository, 0);
        const notificationService = new NotificationService(notificationRepository);
        const authController = new AuthController(userService, sessionManager);
        const userController = new UserController(userService, followService, sessionManager, eventService, notificationService);
        const eventController = new EventController(eventService, sessionManager);
        const rankingController = new RankingController(rankingService);
        const notificationController = new NotificationController(notificationService, sessionManager);
        const settingController = new SettingController(userService, sessionManager);
        const authRouter = new AuthRouter(authController);
        const userRouter = new UserRouter(userController);
        const eventRouter = new EventRouter(eventController);
        const devRouter = new DevRouter(userService, eventService, followService);
        const rankingRouter = new RankingRouter(rankingController);
        const notificationRouter = new NotificationRouter(notificationController);
        const settingRouter = new SettingRouter(settingController);
        const router = new Router(userRouter, authRouter, eventRouter, devRouter, rankingRouter, notificationRouter, settingRouter);

        // 初期化
        const app = await initExpress(express());

        // 認証ミドルウェア
        const publicPaths = ['/api/auth/login', '/api/users',
             '/api/auth/logout', '/api/dev/users', '/api/dev/demo-dev'];
        app.use(async (req: Request, res: Response, next: NextFunction) => {
            console.log('auth info:');
            if(publicPaths.includes(req.path)) {
                console.log('    access to: public path\n');
                return next();
            }
            console.log(`    access to: private path`);
            console.log(`    sessionId: ${req.session.sessionId}`);
            if(req.session.sessionId) {
                const userId = await userService.authorize(req.session.sessionId);
                if (userId) {
                    console.log('    authorized\n');
                    return next();
                }
                else {
                    console.log('    unauthorized\n');
                    res.status(401).json({
                        success: false,
                        message: 'Unauthorized'
                    });
                }
            }
            else {
                console.log('    unauthorized\n');
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }
        });

        app.use('/', router.getRouter());

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('サーバー起動エラー:', error);
        process.exit(1);
    }
}

main();

