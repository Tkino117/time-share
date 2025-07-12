import { Request, Response } from "express";
import { ForbiddenResponse } from "../response/error/ForbiddenResponse";
import { SessionManager } from "../repository";
import * as errors from "../service/errors";
import * as responses from "../response";
import { EventType } from "../database/database";
import { FollowService } from "../service/FollowService";

// req のセッションIDが userId のセッションであるかを確認する（authがあるので削除してもいい気がする）
export function checkSession(req: Request, res: Response, sessionManager: SessionManager, userId: string) {
    if (req.session.sessionId && sessionManager.getSession(req.session.sessionId)?.userId !== userId) {
        new ForbiddenResponse('You are not authorized to access this resource').send(res);
        return false;
    }
    return true;
}

export function handleError(error: any, res: Response) {
    if (error instanceof errors.AbstractError) {
        new responses.ErrorResponse(error.name).send(res);
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

export async function checkPrivacy(userId: string, targetUserId: string, followService: FollowService) {
    if (await followService.isFollowing(userId, targetUserId)) {
        return true;
    }
    if (userId === targetUserId) {
        return true;
    }
    return false;
}

export function convertType(type: string | undefined): EventType {
    switch (type) {
        case 'meal':
            return EventType.MEAL;
        case 'sleep':
            return EventType.SLEEP;
        case 'work':
            return EventType.WORK;
        case 'exercise':
            return EventType.EXERCISE;
        case 'study':
            return EventType.STUDY;
        case 'other':
        case '':
        case undefined:
            return EventType.OTHER;
        default:
            throw new errors.InvalidEventTypeError(type);
    }
}