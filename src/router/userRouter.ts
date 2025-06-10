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
        this.router.get('/me', async (req: Request, res: Response) => this.userController.getMyUser(req, res));
        this.router.get('/:userId', async (req: Request, res: Response) => this.userController.getUser(req, res));
        this.router.put('/:userId', async (req: Request, res: Response) => this.userController.updateUser(req, res, req.params.userId));
        this.router.delete('/:userId', async (req: Request, res: Response) => this.userController.deleteUser(req, res));
    }
}