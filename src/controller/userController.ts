import { UserAlreadyExistsError } from "../service/errors";
import { UserService } from "../service/userService";
import { Request, Response } from "express";

export class UserController {
    constructor(private userService: UserService) {
    }

    async createUser(req: Request, res: Response) {
        const userId: string = req.body.userId;
        const password: string = req.body.password;
        const name: string = req.body.name;
        try {
            await this.userService.createUser({ userId, password, name });
            res.json({
                success: true,
                message: 'Register successful'
            });
        }
        catch(error: any) {
            if (error instanceof UserAlreadyExistsError) {
                res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }
            else {
                console.error(error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        }
    }
}