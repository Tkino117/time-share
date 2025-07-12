import { AbstractRouter } from "./AbstractRouter";
import { UploadController } from "../controller/UploadController";
import { Request, Response } from "express";

export class UploadRouter extends AbstractRouter {
    constructor(private readonly uploadController: UploadController) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        this.router.post('/', async (req: Request, res: Response) => this.uploadController.upload(req, res));
    }
}