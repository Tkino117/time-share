import { AbstractRouter } from "./AbstractRouter";
import { FollowRequestController } from "../controller/FollowRequestController";

export class FollowRequestRouter extends AbstractRouter {
    constructor(private followRequestController: FollowRequestController) {
        super();
    }

    initializeRoutes(): void {
        this.router.get('/follow-requests', async (req, res) => {
            this.followRequestController.getFollowRequests(req, res);
        });
        this.router.post('/follow-requests/:userId', async (req, res) => {
            this.followRequestController.createFollowRequest(req, res);
        });
        this.router.post('/follow-requests/:userId/approve', async (req, res) => {
            this.followRequestController.approveFollowRequest(req, res);
        });
        this.router.post('/follow-requests/:userId/reject', async (req, res) => {
            this.followRequestController.rejectFollowRequest(req, res);
        });
    }
}