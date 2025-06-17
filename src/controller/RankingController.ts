import { Request, Response } from "express";
import { RankingService } from "../service/RankingService";
import { RankingResponseData, RankingsResponseData } from "../response/data";
import { SuccessResponse } from "../response";
import { convertType, handleError } from "./util";

export class RankingController {
    constructor(private readonly rankingService: RankingService) {}

    public async getRankings(req: Request, res: Response) {
        try {
            const rankings = await this.rankingService.getRankings();
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