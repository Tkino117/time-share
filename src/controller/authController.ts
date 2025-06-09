import { Request, Response } from 'express';
import { UserService } from '../service/userService';
import { InvalidPasswordError, UserNotFoundError } from '../service/errors';
import { SessionManager } from '../repository/sessionManager';

export class AuthController {
    constructor(private userService: UserService, private sessionManager: SessionManager) {
    }

    // sessionManagerへの依存をなくしたい!note!
    async login(req: Request, res: Response) {
        const userId: string = req.body.userId;
        const password: string = req.body.password;
        try {
            await this.userService.login(userId, password);
            const session = this.sessionManager.createSession(userId, new Date());
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
    }

    async logout(req: Request, res: Response) {
        if(req.session.sessionId) {
            await this.userService.logout(req.session.sessionId);
            req.session.sessionId = '';
        }
        res.json({
            success: true,
            message: 'Logout successful'
        });
    }
}