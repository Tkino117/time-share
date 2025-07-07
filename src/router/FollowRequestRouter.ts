import { AbstractRouter } from "./AbstractRouter";
import { FollowRequestController } from "../controller/FollowRequestController";

export class FollowRequestRouter extends AbstractRouter {
    constructor(private followRequestController: FollowRequestController) {
        super();
        this.initialize();
    }

    initializeRoutes(): void {
        this.router.get('/', async (req, res) => {
            this.followRequestController.getFollowRequests(req, res);
        });
        this.router.post('/:userId', async (req, res) => {
            this.followRequestController.createFollowRequest(req, res);
        });
        this.router.post('/:userId/approve', async (req, res) => {
            this.followRequestController.approveFollowRequest(req, res);
        });
        this.router.post('/:userId/reject', async (req, res) => {
            this.followRequestController.rejectFollowRequest(req, res);
        });
    }
}