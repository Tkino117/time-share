import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { UserService } from './service/userService';
import { SessionManager } from './repository/sessionManager';
import { UserRepository } from './repository/userRepository';
import cors from 'cors';
import { InvalidPasswordError, UserAlreadyExistsError, UserNotFoundError } from './service/errors';
import path from 'path';
import { Router, UserRouter, AuthRouter, EventRouter } from './router';
import { AuthController } from './controller/authController';

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

const port = 3000;
async function main() {
    const sessionManager = new SessionManager();
    const userService = new UserService(new UserRepository(), sessionManager);
    const authController = new AuthController(userService, sessionManager);
    const authRouter = new AuthRouter(authController);
    const userRouter = new UserRouter();
    const eventRouter = new EventRouter();

    const app = await initExpress(express());

    // 認証ミドルウェア
    const publicPaths = ['/api/auth/login', '/api/register', '/api/auth/logout'];
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

    // 新規登録
    app.post('/api/register', async (req: Request, res: Response) => {
        const userId: string = req.body.userId;
        const password: string = req.body.password;
        const name: string = req.body.name;
        try {
            await userService.createUser({ userId, password, name });
            res.json({
                success: true,
                message: 'Register successful'
            });
        }
        catch(error: any) {
            if (error instanceof UserAlreadyExistsError) {
                res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }
            else {
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        }
    });

    const router = new Router(userRouter, authRouter, eventRouter);
    app.use('/', router.getRouter());

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

main();

