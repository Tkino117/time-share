import { Request, Response } from "express";
import { ForbiddenResponse } from "../response/error/ForbiddenResponse";
import { SessionManager } from "../repository";

// req のセッションIDが userId のセッションであるかを確認する
export function checkSession(req: Request, res: Response, sessionManager: SessionManager, userId: string) {
    if (req.session.sessionId && sessionManager.getSession(req.session.sessionId)?.userId !== userId) {
        new ForbiddenResponse('You are not authorized to access this resource').send(res);
        return false;
    }
    return true;
}