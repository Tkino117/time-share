import { AbstractRouter } from "./AbstractRouter";
import { Request, Response } from "express";
import { SettingController } from "../controller/SettingController";

export class SettingRouter extends AbstractRouter {
    constructor(private readonly settingController: SettingController) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        this.router.get('/', async (req: Request, res: Response) => this.settingController.getSettings(req, res));
        this.router.put('/privacy', async (req: Request, res: Response) => this.settingController.updatePrivacy(req, res));
    }
}