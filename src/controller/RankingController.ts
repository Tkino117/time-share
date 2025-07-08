import { Request, Response } from "express";
import { RankingService } from "../service/RankingService";
import { RankingResponseData, RankingsResponseData } from "../response/data";
import { SuccessResponse } from "../response";
import { auth, convertType, handleError } from "./util";
import { SessionManager } from "../repository";
import { UnauthorizedError } from "../service/errors";
import { UserService } from "../service/UserService";

export class RankingController {
    constructor(private readonly rankingService: RankingService, private readonly sessionManager: SessionManager, private readonly userService: UserService) {}

    public async getRankings(req: Request, res: Response) {
        try {
            let myUserId: string | null = null;
            try {
                myUserId = await auth(req, res, this.sessionManager);
            }
            catch(error: any) {
                if (error instanceof UnauthorizedError) {
                    myUserId = null;
                }
                else {
                    throw error;
                }
            }
            const myUser = myUserId ? await this.userService.getUser(myUserId) : null;
            const rankings = await this.rankingService.getRankingsByMyUser(myUser);
            const data = new RankingsResponseData(rankings, this.rankingService.getRankingStartTime());
            new SuccessResponse(data, 'Rankings retrieved successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }

    public async getRankingByType(req: Request, res: Response) {
        try {
            const type = convertType(req.params.type);
            const ranking = await this.rankingService.getRankingByType(type);
            const data = new RankingResponseData(ranking, this.rankingService.getRankingStartTime());
            new SuccessResponse(data, 'Ranking retrieved successfully').send(res);
        }
        catch(error: any) {
            handleError(error, res);
        }
    }
}