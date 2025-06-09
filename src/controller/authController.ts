import { Request, Response } from 'express';
import { UserService } from '../service/userService';
import { InvalidPasswordError, UserNotFoundError } from '../service/errors';
import { SessionManager } from '../repository/sessionManager';
import { EmptyResponseData, ErrorResponse, ServerErrorResponse, SuccessResponse, UnauthorizedResponse, UserResponseData } from '../response';

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
            if (error instanceof InvalidPasswordError) {
                new ErrorResponse('Invalid password').send(res);
            }
            else if(error instanceof UserNotFoundError) {
                new ErrorResponse('User not found').send(res);
            }
            else {
                console.error(error);
                new ServerErrorResponse('Internal server error').send(res);
            }
        }
    }

    async logout(req: Request, res: Response) {
        if(req.session.sessionId) {
            await this.userService.logout(req.session.sessionId);
            req.session.sessionId = '';
        }
        new SuccessResponse(new EmptyResponseData(), 'Logged out').send(res);
    }
}