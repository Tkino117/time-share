import { UserAlreadyExistsError } from "../service/errors";
import { UserService } from "../service/userService";
import { Request, Response } from "express";
import { CreateResponse, ServerErrorResponse, UserResponseData } from "../response";
import { ErrorResponse } from "../response/error/ErrorResponse";

export class UserController {
    constructor(private userService: UserService) {
    }

    async createUser(req: Request, res: Response) {
        const userId: string = req.body.userId;
        const password: string = req.body.password;
        const name: string = req.body.name;
        try {
            const user = await this.userService.createUser({ userId, password, name });
            const data = new UserResponseData(user);
            new CreateResponse(data, 'Register successful').send(res);
        }
        catch(error: any) {
            if (error instanceof UserAlreadyExistsError) {
                new ErrorResponse('User already exists').send(res);
            }
            else {
                console.error(error);
                new ServerErrorResponse('Internal server error').send(res);
            }
        }
    }
}