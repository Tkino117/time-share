import { InvalidNameError, InvalidPasswordError, InvalidUserIdError, UserAlreadyExistsError, UserNotFoundError } from "../service/errors";
import { UserService } from "../service/userService";
import { Request, Response } from "express";
import { CreateResponse, EmptyResponseData, ServerErrorResponse, SuccessResponse, UserResponseData } from "../response";
import { ErrorResponse } from "../response/error/ErrorResponse";
import { SessionManager } from "../repository";
import { ForbiddenResponse } from "../response/error/ForbiddenResponse";
import { checkSession } from "./util";

export class UserController {
    constructor(private userService: UserService, private sessionManager: SessionManager) {
    }

    async createUser(req: Request, res: Response) {
        if (!req.body.userId || !req.body.password || !req.body.name) {
            new ErrorResponse('Invalid request body').send(res);
            return;
        }
        const userId: string = req.body.userId;
        const password: string = req.body.password;
        const name: string = req.body.name;
        if (userId === 'me' || userId === 'Me' || userId === 'mE' || userId === 'ME') {
            new ErrorResponse('User id cannot be "me"').send(res);
            return;
        }
        try {
            const user = await this.userService.createUser({ userId, password, name });
            const data = new UserResponseData(user);
            new CreateResponse(data, 'Register successful').send(res);
        }
        catch(error: any) {
            if (error instanceof UserAlreadyExistsError) {
                new ErrorResponse('User already exists').send(res);
            }
            else if (error instanceof InvalidPasswordError) {
                new ErrorResponse('Password is too short').send(res);
            }
            else if (error instanceof InvalidUserIdError) {
                new ErrorResponse('User id is empty').send(res);
            }
            else if (error instanceof InvalidNameError) {
                new ErrorResponse('Name is empty').send(res);
            }
            else {
                console.error(error);
                new ServerErrorResponse('Internal server error').send(res);
            }
        }
    }

    async getUser(req: Request, res: Response) {
        const userId: string = req.params.userId;
        try {
            const user = await this.userService.getUser(userId);
            const data = new UserResponseData(user);
            new SuccessResponse(data, 'Get user successful').send(res);
        }
        catch(error: any) {
            if (error instanceof UserNotFoundError) {
                new ErrorResponse('User not found').send(res);
            }
            else {
                console.error(error);
                new ServerErrorResponse('Internal server error').send(res);
            }
        }
    }

    async updateUser(req: Request, res: Response, userId: string) {
        const newUserId: string | undefined = req.body.userId;
        const newPassword: string | undefined = req.body.password;
        const newName: string | undefined = req.body.name;
        try {
            if (!checkSession(req, res, this.sessionManager, userId)) {
                return;
            }
            const user = await this.userService.updateUser(userId, { userId: newUserId, password: newPassword, name: newName });
            const data = new UserResponseData(user);
            new SuccessResponse(data, 'Update user successful').send(res);
        }
        catch(error: any) {
            if (error instanceof UserNotFoundError) {
                new ErrorResponse('User not found').send(res);
            }
            else if (error instanceof InvalidUserIdError) {
                new ErrorResponse('User id is invalid').send(res);
            }
            else if (error instanceof UserAlreadyExistsError) {
                new ErrorResponse('User id already exists').send(res);
            }
            else if (error instanceof InvalidPasswordError) {
                new ErrorResponse('Password is too short').send(res);
            }
            else if (error instanceof InvalidNameError) {
                new ErrorResponse('Name is empty').send(res);
            }
            else {
                console.error(error);
                new ServerErrorResponse('Internal server error').send(res);
            }
        }
    }

    async deleteUser(req: Request, res: Response) {
        const userId: string = req.params.userId;
        try {
            if (!checkSession(req, res, this.sessionManager, userId)) {
                return;
            }
            await this.userService.deleteUser(userId);
            new SuccessResponse(new EmptyResponseData(), 'Delete user successful').send(res);
        }
        catch(error: any) {
            if (error instanceof UserNotFoundError) {
                new ErrorResponse('User not found').send(res);
            }
            else {
                console.error(error);
                new ServerErrorResponse('Internal server error').send(res);
            }
        }
    }

    async getMyUser(req: Request, res: Response) {
        if (!req.session.sessionId) {
            new ErrorResponse('Session not found').send(res);
            return;
        }
        const userId = await this.sessionManager.getUserId(req.session.sessionId);
        if (!userId) {
            new ErrorResponse('Session not found').send(res);
            return;
        }
        const user = await this.userService.getUser(userId);
        const data = new UserResponseData(user);
        new SuccessResponse(data, 'Get my user successful').send(res);
    }
}