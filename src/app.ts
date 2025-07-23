import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { Router, UserRouter, AuthRouter, EventRouter, DevRouter, RankingRouter, SettingRouter, NotificationRouter, FollowRequestRouter, UploadRouter } from './router';
import { AuthController, UserController, EventController, RankingController, SettingController, NotificationController, FollowRequestController, UploadController } from './controller';
import { UserService, EventService, FollowService, RankingService, NotificationService } from './service';
import { SessionManager, UserRepository, EventRepository, FollowRepository, NotificationRepository } from './repository';
import { Database } from './database/database';
import { FollowRequestService } from './service/FollowRequestService';
import { FollowRequestRepository } from './repository/FollowRequestRepository';
import fileUpload from 'express-fileupload';

// セッションの型定義
declare module 'express-session' {
    interface SessionData {
        sessionId: string;
    }
}

async function initExpress(app: express.Express) {
    // CORS の設定（!note!本番環境で見直すこと）
    app.use(cors({
        origin: true,
        credentials: true
    }));

    // json のパース
    app.use(express.json());

    // nginx 用設定
    app.set('trust proxy', 1);

    // cookie の設定。デフォルトの session を利用する
    // https のとき、secure: true を設定する
    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            // secure: true,
            maxAge: 24 * 60 * 60 * 1000 // 1日
        }
    }));

    // ログ出力
    app.use(async (req: Request, res: Response, next: NextFunction) => {
        console.log('--------------------------------');
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
        const followRequestRepository = new FollowRequestRepository();
        const sessionManager = new SessionManager();
        const followService = new FollowService(followRepository, userRepository, eventRepository);
        const userService = new UserService(userRepository, sessionManager, followRepository, followRequestRepository);
        const eventService = new EventService(eventRepository, userRepository, sessionManager);
        const rankingService = new RankingService(eventRepository, userRepository, followRepository, followRequestRepository, 1);
        const notificationService = new NotificationService(notificationRepository, userService);
        const followRequestService = new FollowRequestService(followRequestRepository, userRepository, followRepository);
        const authController = new AuthController(userService, sessionManager);
        const userController = new UserController(userService, followService, sessionManager, eventService, notificationService);
        const eventController = new EventController(eventService, sessionManager);
        const rankingController = new RankingController(rankingService, sessionManager, userService);
        const notificationController = new NotificationController(notificationService, sessionManager);
        const settingController = new SettingController(userService, sessionManager);
        const followRequestController = new FollowRequestController(followRequestService, followService, notificationService, userService, sessionManager);
        const uploadController = new UploadController(userService, sessionManager);
        const authRouter = new AuthRouter(authController);
        const userRouter = new UserRouter(userController);
        const eventRouter = new EventRouter(eventController);
        const devRouter = new DevRouter(userService, eventService, followService, notificationService);
        const rankingRouter = new RankingRouter(rankingController);
        const notificationRouter = new NotificationRouter(notificationController);
        const settingRouter = new SettingRouter(settingController);
        const followRequestRouter = new FollowRequestRouter(followRequestController);
        const uploadRouter = new UploadRouter(uploadController);
        const router = new Router(userRouter, authRouter, eventRouter, devRouter, rankingRouter, notificationRouter, settingRouter, followRequestRouter, uploadRouter);

        // 初期化
        const app = await initExpress(express());

        // 静的ファイルへのアクセス制御とリダイレクト
        app.use(async (req: Request, res: Response, next: NextFunction) => {
            // APIエンドポイントの場合は既存の認証処理を使用
            if (req.path.startsWith('/api/')) {
                const publicPaths = ['/api/auth/login', '/api/users',
                     '/api/auth/logout', '/api/dev/users', '/api/dev/demo-dev'];
                
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
                        console.log('    authorized');
                        return next();
                    }
                    else {
                        console.log('    unauthorized');
                        res.status(401).json({
                            success: false,
                            message: 'Unauthorized'
                        });
                    }
                }
                else {
                    console.log('    unauthorized');
                    res.status(401).json({
                        success: false,
                        message: 'Unauthorized'
                    });
                }
            } else {
                // 静的ファイルへのアクセスの場合
                const isHtmlFile = req.path.endsWith('.html') || req.path === '/';
                const isLoginPage = req.path === '/login.html';
                const isDevPage = req.path === '/dev.html';
                const isRootPath = req.path === '/';
                
                // ルートパス（/）へのアクセスの場合
                if (isRootPath) {
                    if (!req.session.sessionId) {
                        console.log('    redirecting to login.html (root path, no session)');
                        return res.redirect('/login.html');
                    }
                    
                    const userId = await userService.authorize(req.session.sessionId);
                    if (!userId) {
                        console.log('    redirecting to login.html (root path, invalid session)');
                        return res.redirect('/login.html');
                    }
                    
                    console.log('    redirecting to home.html (root path, authenticated)');
                    return res.redirect('/home.html');
                }
                
                if (isHtmlFile && !isLoginPage && !isDevPage) {
                    // HTMLファイルへのアクセスで、ログインページとdev.html以外の場合
                    if (!req.session.sessionId) {
                        console.log('    redirecting to login.html');
                        return res.redirect('/login.html');
                    }
                    
                    const userId = await userService.authorize(req.session.sessionId);
                    if (!userId) {
                        console.log('    redirecting to login.html (invalid session)');
                        return res.redirect('/login.html');
                    }
                }
                
                // 認証OKまたはログインページまたはdev.htmlの場合は静的ファイルを配信
                return next();
            }
        });

        // 静的ファイルの配信設定（認証チェックの後に配置）
        app.use(express.static(path.join(__dirname, '../public')));

        // ファイルアップロードミドルウェア
        app.use(fileUpload());

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

