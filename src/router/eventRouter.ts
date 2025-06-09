import { AbstractRouter } from "./AbstractRouter";
import { EventController } from "../controller/eventController";

export class EventRouter extends AbstractRouter {
    constructor(private eventController: EventController) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
    }
}