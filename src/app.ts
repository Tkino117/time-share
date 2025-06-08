import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { UserService } from './service/userService';
import { SessionManager } from './repository/sessionManager';
import { UserRepository } from './repository/userRepository';
import cors from 'cors';
import { InvalidPasswordError, UserAlreadyExistsError, UserNotFoundError } from './service/errors';
import path from 'path';

declare module 'express-session' {
    interface SessionData {
        sessionId: string;
    }
}

const app = express();
const port = 3000;


async function main() {
    const sessionManager = new SessionManager();
    const userService = new UserService(new UserRepository(), sessionManager);

    // 静的ファイルの配信設定
    app.use(express.static(path.join(__dirname, '../public')));

    // CORS の設定（!note!本番環境で見直すこと）
    app.use(cors({
        origin: true,
        credentials: true
    }));

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
        console.log(req.body);
        console.log();
        next();
    });

    // 認証
    const publicPaths = ['/api/login', '/api/register', '/api/logout'];
    app.use(async (req: Request, res: Response, next: NextFunction) => {
        if(publicPaths.includes(req.path)) {
            return next();
        }
        if(req.session.sessionId) {
            console.log('sessionId', req.session.sessionId);
            const userId = await userService.authorize(req.session.sessionId);
            if (userId) {
                console.log('authorized access');
                return next();
            }
            else {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }
        }
        else {
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


    // ログイン処理
    app.post('/api/login', async (req: Request, res: Response) => {
        const userId: string = req.body.userId;
        const password: string = req.body.password;
        try {
            await userService.login(userId, password);
            const session = sessionManager.createSession(userId, new Date());
            req.session.sessionId = session.sessionId;
            res.json({
                success: true,
                message: 'Login successful',
                sessionId: session.sessionId,
                userId: userId
            });
        }
        catch(error: any) {
            if (error instanceof InvalidPasswordError) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid password'
                });
            }
            else if(error instanceof UserNotFoundError) {
                res.status(401).json({
                    success: false,
                    message: 'User not found'
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

    // ログアウト処理
    app.post('/api/logout', async (req: Request, res: Response) => {
        if(req.session.sessionId) {
            await userService.logout(req.session.sessionId);
            req.session.sessionId = '';
        }
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });

    // サンプル api
    app.get('/api/sample', async (req: Request, res: Response) => {
        res.json({
            success: true,
            message: 'Sample API'
        });
    });

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

main();

