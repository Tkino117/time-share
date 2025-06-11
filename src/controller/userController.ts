import { UserService } from "../service/UserService";
import { Request, Response } from "express";
import { CreateResponse, EmptyResponseData, EventsResponseData, FeedResponseData, SuccessResponse, UserEventsResponseData, UserResponseData, UsersResponseData } from "../response";
import { ErrorResponse } from "../response/error/ErrorResponse";
import { SessionManager } from "../repository";
import { auth, checkSession, handleError } from "./util";
import { FollowService } from "../service/FollowService";
import { EventService } from "../service/EventService";

export class UserController {
    constructor(private userService: UserService, private followService: FollowService, private sessionManager: SessionManager, private eventService: EventService) {
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
            const user = await this.userService.getUser(userId);
            const data = new UserResponseData(user);
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
            new SuccessResponse(new EmptyResponseData(), 'Delete user successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async getMyUser(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const user = await this.userService.getUser(userId);
            const data = new UserResponseData(user);
            new SuccessResponse(data, 'Get my user successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async followUser(req: Request, res: Response) {
        const followingId: string = req.params.userId;
        try {
            const userId = await auth(req, res, this.sessionManager);
            await this.followService.followUser(userId, followingId);
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
            const userId = await auth(req, res, this.sessionManager);
            const followings = await this.followService.getFollowings(userId);
            const users = await Promise.all(followings.map(following => this.userService.getUser(following)));
            const data = new UsersResponseData(users);
            new SuccessResponse(data, 'Get followings successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    async getFollowers(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const followers = await this.followService.getFollowers(userId);
            const users = await Promise.all(followers.map(follower => this.userService.getUser(follower)));
            const data = new UsersResponseData(users);
            new SuccessResponse(data, 'Get followers successful').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }
    
    async getMyEvents(req: Request, res: Response) {
        try {
            const userId = await auth(req, res, this.sessionManager);
            const events = await this.eventService.getEventsByUserId(userId);
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
                const events = await this.eventService.getEventsByUserId(following);
                userEvents.push(new UserEventsResponseData(user, events));
            }
            const data = new FeedResponseData(userEvents);
            new SuccessResponse(data, 'Feed retrieved successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

}