import { AbstractRouter } from "./AbstractRouter";
import { UserController } from "../controller/userController";
import { Request, Response } from "express";

export class UserRouter extends AbstractRouter {
    constructor(private userController: UserController) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        this.router.post('/', async (req: Request, res: Response) => this.userController.createUser(req, res));
    }
}