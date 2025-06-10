import { Request, Response } from "express";
import { ForbiddenResponse } from "../response/error/ForbiddenResponse";
import { SessionManager } from "../repository";
import * as errors from "../service/errors";
import * as responses from "../response";

// req のセッションIDが userId のセッションであるかを確認する
export function checkSession(req: Request, res: Response, sessionManager: SessionManager, userId: string) {
    if (req.session.sessionId && sessionManager.getSession(req.session.sessionId)?.userId !== userId) {
        new ForbiddenResponse('You are not authorized to access this resource').send(res);
        return false;
    }
    return true;
}

export function handleError(error: any, res: Response) {
    if (error instanceof errors.UserNotFoundError) {
        new responses.NotFoundResponse('User not found').send(res);
    }
    else if (error instanceof errors.UserAlreadyExistsError) {
        new responses.ErrorResponse('User already exists').send(res);
    }
    else if (error instanceof errors.InvalidPasswordError) {
        new responses.ErrorResponse('Invalid password').send(res);
    }
    else if (error instanceof errors.InvalidUserIdError) {
        new responses.ErrorResponse('Invalid user id').send(res);
    }
    else if (error instanceof errors.InvalidNameError) {
        new responses.ErrorResponse('Invalid name').send(res);
    }
    else if (error instanceof errors.UnauthorizedError) {
        new responses.UnauthorizedResponse('Unauthorized').send(res);
    }
    else if (error instanceof errors.EventNotFoundError) {
        new responses.NotFoundResponse('Event not found').send(res);
    }
    else if (error instanceof errors.InvalidTimeRangeError) {
        new responses.ErrorResponse('Invalid time range').send(res);
    }
    else if (error instanceof errors.TimeConflictError) {
        new responses.ErrorResponse('Time conflict').send(res);
    }
    else if (error instanceof errors.FollowAlreadyExistsError) {
        new responses.ErrorResponse('Already following').send(res);
    }
    else if (error instanceof errors.FollowNotFoundError) {
        new responses.NotFoundResponse('Not following').send(res);
    }
    else {
        console.error(error);
        new responses.ServerErrorResponse('Internal server error').send(res);
    }
}

export async function auth(req: Request, res: Response, sessionManager: SessionManager): Promise<string> {
    if (!req.session.sessionId) {
        throw new errors.UnauthorizedError();
    }
    const userId: string | undefined = await sessionManager.getUserId(req.session.sessionId);
    if (!userId) {
        throw new errors.UnauthorizedError();
    }
    return userId;
}