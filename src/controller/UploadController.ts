import { Request, Response } from "express";
import { UserService } from "../service/UserService";
import { SessionManager } from "../repository";
import { auth, handleError } from "./util";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { SuccessResponse } from "../response";
import { EmptyResponseData } from "../response/data";

export class UploadController {
    constructor(private userService: UserService, private sessionManager: SessionManager) {
    }

    async upload(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            if (!req.files || !req.files.image) {
                throw new Error('Image is required');
            }
            const image = req.files.image as UploadedFile;
            if (!image.mimetype.startsWith('image/')) {
                throw new Error('Invalid image format');
            }
            const fileName = Date.now() + "-" + image.name;
            //!note! ファイルパスを絶対パスにする
            const filePath = path.join('public', 'uploads', 'avatars', fileName);
            await image.mv(filePath);
            const imageUrl = '/uploads/avatars/' + fileName;
            await this.userService.uploadProfileImage(userId, imageUrl);
            new SuccessResponse(new EmptyResponseData(), 'Upload profile image successful').send(res);
        }
        catch (error) {
            handleError(error, res);
        }
    }
}