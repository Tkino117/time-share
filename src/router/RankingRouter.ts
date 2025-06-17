import { AbstractRouter } from "./AbstractRouter";
import { RankingController } from "../controller/RankingController";
import { Request, Response } from "express";

export class RankingRouter extends AbstractRouter {
    constructor(private rankingController: RankingController) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        this.router.get('/', async (req: Request, res: Response) => this.rankingController.getRankings(req, res));
        this.router.get('/:type', async (req: Request, res: Response) => this.rankingController.getRankingByType(req, res));
    }
}