import { UserService } from "../service/UserService";
import { Request, Response } from "express";
import { CreateResponse, EmptyResponseData, EventsResponseData, FeedResponseData, SuccessResponse, UserEventsResponseData, UserResponseData, UsersResponseData, UserWithStatsResponseData, UsersWithStatsResponseData } from "../response";
import { SessionManager } from "../repository";
import { auth, checkPrivacy, checkSession, handleError } from "./util";
import { FollowService, EventService, NotificationService } from "../service";
import { ErrorResponse, ForbiddenResponse } from "../response";
import { Event } from "../database/database";

export class UserController {
    constructor(private userService: UserService, private followService: FollowService, private sessionManager: SessionManager, private eventService: EventService, private notificationService: NotificationService) {
    }

    async createUser(req: Request, res: Response) {
        if (!req.body.userId || !req.body.password || !req.body.name) {
            new ErrorResponse('Invalid request body').send(res);
            return;
        }
        const userId: string = req.body.userId;
        const password: string = req.body.password;
        const name: string = req.body.name;
        if (userId === 'me' || userId === 'Me' || userId === 'mE' || userId === 'ME') {
            new ErrorResponse('User id cannot be "me"').send(res);
            return;
        }
        try {
            const user = await this.userService.createUser({ userId, password, name });
            const data = new UserResponseData(user);
            new CreateResponse(data, 'Register successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async getUser(req: Request, res: Response) {
        const userId: string = req.params.userId;
        try {
            const userWithStats = await this.userService.getUserWithStats(userId);
            const data = new UserWithStatsResponseData(userWithStats);
            new SuccessResponse(data, 'Get user successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async updateUser(req: Request, res: Response, userId: string) {
        const newUserId: string | undefined = req.body.userId;
        const newPassword: string | undefined = req.body.password;
        const newName: string | undefined = req.body.name;
        try {
            if (!checkSession(req, res, this.sessionManager, userId)) {
                return;
            }
            const user = await this.userService.updateUser(userId, { userId: newUserId, password: newPassword, name: newName });
            const data = new UserResponseData(user);
            new SuccessResponse(data, 'Update user successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async deleteUser(req: Request, res: Response) {
        const userId: string = req.params.userId;
        try {
            if (!checkSession(req, res, this.sessionManager, userId)) {
                return;
            }
            await this.userService.deleteUser(userId);
            if(req.session.sessionId) {
                this.sessionManager.deleteSession(req.session.sessionId);
                req.session.sessionId = '';
            }
            new SuccessResponse(new EmptyResponseData(), 'Delete user successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async getMyUser(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const userWithStats = await this.userService.getUserWithStats(userId);
            const data = new UserWithStatsResponseData(userWithStats);
            new SuccessResponse(data, 'Get my user successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async followUser(req: Request, res: Response) {
        console.log(`UserController.followUser : to ${req.params.userId}`);
        const followingId: string = req.params.userId;
        try {
            const userId = await auth(req, res, this.sessionManager);
            await this.followService.followUser(userId, followingId);
            await this.notificationService.createFollowNotification(userId, followingId);
            new SuccessResponse(new EmptyResponseData(), 'Follow user successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async unfollowUser(req: Request, res: Response) {
        const followingId: string = req.params.userId;
        try {
            const userId = await auth(req, res, this.sessionManager);
            await this.followService.unfollowUser(userId, followingId);
            new SuccessResponse(new EmptyResponseData(), 'Unfollow user successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async getFollowings(req: Request, res: Response) {
        try {
            const targetUserId = req.params.userId;
            const userId = await auth(req, res, this.sessionManager);
            const followings = await this.followService.getFollowings(targetUserId);
            const users = await Promise.all(followings.map(following => this.userService.getUserWithStats(following)));
            const data = new UsersWithStatsResponseData(users);
            new SuccessResponse(data, 'Get followings successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async getFollowers(req: Request, res: Response) {
        try {
            const targetUserId = req.params.userId;
            const userId = await auth(req, res, this.sessionManager);
            const followers = await this.followService.getFollowers(targetUserId);
            const users = await Promise.all(followers.map(follower => this.userService.getUserWithStats(follower)));
            const data = new UsersWithStatsResponseData(users);
            new SuccessResponse(data, 'Get followers successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }
    
    async getEvents(req: Request, res: Response) {
        try {
            const myUserId = await auth(req, res, this.sessionManager);
            const targetUserId = req.params.userId;
            if (!await checkPrivacy(myUserId, targetUserId, this.followService)) {
                // !note! あとでエラーつくる
                new ForbiddenResponse('Privacy violation').send(res);
                return;
            }
            let events: Event[];
            if (myUserId === targetUserId) {
                events = await this.eventService.getMyEventsByUserId(targetUserId);
            } else {
                events = await this.eventService.getOtherEventsByUserId(targetUserId);
            }
            const data = new EventsResponseData(events);
            new SuccessResponse(data, 'Events retrieved successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async getFeed(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const followings = await this.followService.getFollowings(userId);
            const userEvents: UserEventsResponseData[] = [];
            for (const following of followings) {
                const user = await this.userService.getUser(following);
                const events = await this.eventService.getOtherEventsByUserId(following);
                userEvents.push(new UserEventsResponseData(user, events));
            }
            const data = new FeedResponseData(userEvents);
            new SuccessResponse(data, 'Feed retrieved successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async searchUser(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const query = req.query.query as string || '';
            const users = await this.userService.searchUser(query, userId);
            const usersWithStats = await Promise.all(users.map(user => this.userService.getUserWithStats(user.userId)));
            const data = new UsersWithStatsResponseData(usersWithStats);
            new SuccessResponse(data, 'Search user successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }
}