import { Request, Response } from "express";
import { auth, handleError } from "./util";
import { FollowRequestService } from "../service/FollowRequestService";
import { SessionManager } from "../repository";
import { SuccessResponse } from "../response";
import { FollowService, NotificationService, UserService} from "../service";
import { FollowRequestsResponseData } from "../response/data";
import { FollowSelfError } from "../service/errors/FollowError";

export class FollowRequestController {
    constructor(private followRequestService: FollowRequestService,
                private followService: FollowService,
                private notificationService: NotificationService,
                private userService: UserService,
                private sessionManager: SessionManager) {}

    async getFollowRequests(req: Request, res: Response): Promise<void> {
        try {
            const myUserId = await auth(req, res, this.sessionManager);
            const followRequests = await this.followRequestService.getFollowRequestsByToUserId(myUserId);
            const users = followRequests.map(followRequest => followRequest.fromUserId);
            const usersWithStats = await Promise.all(users.map(user => this.userService.getUserWithStats(user, myUserId)));
            new SuccessResponse(new FollowRequestsResponseData(usersWithStats), 'Follow requests fetched successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async createFollowRequest(req: Request, res: Response): Promise<void> {
        try {
            const fromUserId = await auth(req, res, this.sessionManager);
            const toUserId = req.params.userId;
            if (fromUserId === toUserId) {
                throw new FollowSelfError(fromUserId);  
            }
            const followRequest = await this.followRequestService.createFollowRequest(fromUserId, toUserId);
            await this.notificationService.createFollowRequestNotification(fromUserId, toUserId);

            new SuccessResponse(followRequest, 'Follow request created successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async approveFollowRequest(req: Request, res: Response): Promise<void> {
        try {
            const toUserId = await auth(req, res, this.sessionManager);
            const fromUserId = req.params.userId;
            const followRequest = await this.followRequestService.approveFollowRequest(fromUserId, toUserId);
            await this.notificationService.createFollowRequestAcceptedNotification(fromUserId, toUserId);
            new SuccessResponse(followRequest, 'Follow request accepted successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async rejectFollowRequest(req: Request, res: Response): Promise<void> {
        try {
            const toUserId = await auth(req, res, this.sessionManager);
            const fromUserId = req.params.userId;
            const followRequest = await this.followRequestService.rejectFollowRequest(fromUserId, toUserId);
            new SuccessResponse(followRequest, 'Follow request rejected successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }
}