import { Request, Response } from 'express';
import { UserService } from '../service/userService';
import { InvalidPasswordError, UserNotFoundError } from '../service/errors';
import { SessionManager } from '../repository/sessionManager';
import { EmptyResponseData, ErrorResponse, ServerErrorResponse, SuccessResponse, UnauthorizedResponse, UserResponseData } from '../response';
import { handleError } from './util';

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
            const user = await this.userService.getUser(userId);
            const data = new UserResponseData(user);
            new SuccessResponse(data, 'Logged in').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async logout(req: Request, res: Response) {
        try {
        if(req.session.sessionId) {
            await this.userService.logout(req.session.sessionId);
            req.session.sessionId = '';
            }
            new SuccessResponse(new EmptyResponseData(), 'Logged out').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }
}