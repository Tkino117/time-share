import { Request, Response } from "express";
import { SuccessResponse, UserSettingsResponseData } from "../response";
import { UserService } from "../service/UserService";
import { auth } from "./util";
import { SessionManager } from "../repository";

export class SettingController {
    constructor(private readonly userService: UserService, private readonly sessionManager: SessionManager) {
    }

    public async getSettings(req: Request, res: Response) {
        const userId = await auth(req, res, this.sessionManager);
        const settings = await this.userService.getSettings(userId);
        new SuccessResponse(new UserSettingsResponseData(settings), 'Settings retrieved successfully').send(res);
    }

    public async updatePrivacy(req: Request, res: Response) {
        const userId = await auth(req, res, this.sessionManager);
        const privacy = req.body.privacy;
        const settings = await this.userService.updateSettings(userId, { privacy: privacy });
        new SuccessResponse(new UserSettingsResponseData(settings), 'Privacy updated successfully').send(res);
    }
}